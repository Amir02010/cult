const express = require('express');
const { db, save, uid } = require('../lib/db');
const geo = require('../lib/geo');

const router = express.Router();

/** Settings that are safe to expose to guests. */
function publicSettings(s) {
  return {
    restaurantName: s.restaurantName,
    tagline: s.tagline,
    address: s.address,
    phone: s.phone,
    currency: s.currency,
    workingHours: s.workingHours,
    instagram: s.instagram,
    telegram: s.telegram,
    geoRequired: s.geoRequired,
    geoConfigured: geo.isConfigured(s),
    siteAccess: s.siteAccess || 'open',
    orderingEnabled: s.orderingEnabled,
    requireTable: s.requireTable,
    radiusMeters: s.radiusMeters,
    lat: s.lat,
    lng: s.lng,
  };
}

/** Reads the geo token a guest may send with a request. */
function geoClaim(req) {
  const header = req.headers['x-geo-token'];
  return header ? geo.verifyToken(String(header)) : null;
}

/**
 * In `onsite` mode the menu itself is withheld outside the restaurant, so the
 * site really is unavailable rather than merely showing a blocked button.
 */
function siteLocked(settings, req) {
  if ((settings.siteAccess || 'open') !== 'onsite') return false;
  if (!geo.isConfigured(settings)) return false; // zone not set up yet
  const claim = geoClaim(req);
  if (!claim || claim.bypass) return true;
  return !geo.evaluate(settings, { lat: claim.lat, lng: claim.lng, accuracy: 0 }).allowed;
}

router.get('/menu', (req, res) => {
  const data = db();

  if (siteLocked(data.settings, req)) {
    return res.json({
      locked: true,
      settings: publicSettings(data.settings),
      categories: [],
      items: [],
      tables: [],
    });
  }

  res.json({
    locked: false,
    settings: publicSettings(data.settings),
    categories: data.categories
      .filter((c) => c.visible !== false)
      .sort((a, b) => a.order - b.order),
    items: data.items
      .filter((i) => i.visible !== false)
      .sort((a, b) => a.order - b.order),
    tables: data.tables
      .filter((t) => t.active !== false)
      .map((t) => ({ code: t.code, name: t.name, zone: t.zone })),
  });
});

/**
 * Checks a reported position against the restaurant geofence.
 * On success returns a short-lived signed token: the order endpoint accepts
 * nothing else, so a client cannot simply flip a boolean and order from home.
 */
router.post('/geo/verify', (req, res) => {
  const data = db();
  const { lat, lng, accuracy, deviceId } = req.body || {};

  if (!data.settings.geoRequired) {
    return res.json({
      allowed: true,
      bypass: true,
      token: geo.issueToken({ did: deviceId || 'anon', bypass: true }),
      radius: data.settings.radiusMeters,
      expiresIn: geo.GEO_TTL,
    });
  }

  const result = geo.evaluate(data.settings, {
    lat: Number(lat),
    lng: Number(lng),
    accuracy: Number(accuracy),
  });

  if (!result.allowed) return res.status(403).json(result);

  const token = geo.issueToken({
    did: deviceId || 'anon',
    lat: Number(lat),
    lng: Number(lng),
    dist: result.distance,
  });
  res.json({ ...result, token, expiresIn: geo.GEO_TTL });
});

router.post('/orders', (req, res) => {
  const data = db();
  const s = data.settings;

  if (!s.orderingEnabled) {
    return res.status(423).json({ error: 'ordering_disabled' });
  }

  const { items, tableCode, comment, guestName, phone, geoToken, deviceId } =
    req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'empty_cart' });
  }

  // --- geofence gate -------------------------------------------------------
  let geoInfo = null;
  if (s.geoRequired && geo.isConfigured(s)) {
    const claim = geo.verifyToken(geoToken);
    if (!claim || claim.bypass) {
      return res.status(403).json({ error: 'geo_required' });
    }
    if (deviceId && claim.did && claim.did !== deviceId) {
      return res.status(403).json({ error: 'geo_device_mismatch' });
    }
    // Re-check against current settings: the admin may have moved the fence
    // after the token was issued.
    const recheck = geo.evaluate(s, {
      lat: claim.lat,
      lng: claim.lng,
      accuracy: 0,
    });
    if (!recheck.allowed) {
      return res.status(403).json({ error: 'geo_out_of_range', ...recheck });
    }
    geoInfo = { lat: claim.lat, lng: claim.lng, distance: claim.dist };
  }

  // --- table gate ----------------------------------------------------------
  let table = null;
  if (s.requireTable) {
    table = data.tables.find(
      (t) => t.active !== false && String(t.code).toUpperCase() === String(tableCode || '').toUpperCase()
    );
    if (!table) return res.status(400).json({ error: 'table_required' });
  }

  // --- prices are taken from the server, never from the client -------------
  const lines = [];
  for (const line of items) {
    const item = data.items.find((i) => i.id === line.id);
    if (!item || item.visible === false) {
      return res.status(400).json({ error: 'item_unavailable', id: line.id });
    }
    const qty = Math.max(1, Math.min(50, parseInt(line.qty, 10) || 1));
    lines.push({
      itemId: item.id,
      name: item.name,
      price: item.price,
      qty,
      sum: item.price * qty,
    });
  }
  const total = lines.reduce((acc, l) => acc + l.sum, 0);

  const order = {
    id: uid('ord'),
    publicId: String(Math.floor(1000 + Math.random() * 9000)),
    number: data.orders.length + 1,
    tableCode: table ? table.code : null,
    tableName: table ? table.name : null,
    items: lines,
    total,
    comment: (comment || '').slice(0, 500),
    guestName: (guestName || '').slice(0, 80),
    phone: (phone || '').slice(0, 40),
    status: 'new',
    geo: geoInfo,
    deviceId: deviceId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.orders.unshift(order);
  if (data.orders.length > 2000) data.orders.length = 2000;
  save();

  res.status(201).json({
    id: order.id,
    publicId: order.publicId,
    number: order.number,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
  });
});

router.get('/orders/:id', (req, res) => {
  const data = db();
  const order = data.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'not_found' });
  res.json({
    id: order.id,
    publicId: order.publicId,
    number: order.number,
    status: order.status,
    total: order.total,
    items: order.items,
    tableName: order.tableName,
    comment: order.comment,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
});

module.exports = router;
module.exports.publicSettings = publicSettings;
