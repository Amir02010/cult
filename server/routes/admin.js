const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { db, save, uid } = require('../lib/db');
const { requireStaff, requireAdmin } = require('../lib/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
      cb(null, uid('img') + ext);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|avif|gif)$/.test(file.mimetype);
    cb(ok ? null : new Error('unsupported_type'), ok);
  },
});

const ORDER_STATUSES = ['new', 'accepted', 'cooking', 'served', 'cancelled'];

/* ------------------------------------------------------------------ orders */

router.get('/orders', requireStaff, (req, res) => {
  const data = db();
  const { status, limit } = req.query;
  let list = data.orders;
  if (status && status !== 'all') list = list.filter((o) => o.status === status);
  res.json({
    orders: list.slice(0, Math.min(500, parseInt(limit, 10) || 200)),
    counts: ORDER_STATUSES.reduce((acc, s) => {
      acc[s] = data.orders.filter((o) => o.status === s).length;
      return acc;
    }, { all: data.orders.length }),
  });
});

router.patch('/orders/:id', requireStaff, (req, res) => {
  const data = db();
  const order = data.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'not_found' });
  const { status } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'bad_status' });
  }
  order.status = status;
  order.updatedAt = new Date().toISOString();
  save();
  res.json(order);
});

router.delete('/orders/:id', requireAdmin, (req, res) => {
  const data = db();
  const i = data.orders.findIndex((o) => o.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not_found' });
  data.orders.splice(i, 1);
  save();
  res.json({ ok: true });
});

/* -------------------------------------------------------------- categories */

router.get('/categories', requireAdmin, (req, res) => {
  res.json(db().categories.slice().sort((a, b) => a.order - b.order));
});

router.post('/categories', requireAdmin, (req, res) => {
  const data = db();
  const body = req.body || {};
  const category = {
    id: uid('cat'),
    slug: (body.slug || uid('c')).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    icon: body.icon || 'bowl',
    image: body.image || '',
    name: body.name || { ru: '', en: '', uz: '' },
    description: body.description || { ru: '', en: '', uz: '' },
    visible: body.visible !== false,
    order: data.categories.length + 1,
  };
  data.categories.push(category);
  save();
  res.status(201).json(category);
});

router.put('/categories/:id', requireAdmin, (req, res) => {
  const data = db();
  const category = data.categories.find((c) => c.id === req.params.id);
  if (!category) return res.status(404).json({ error: 'not_found' });
  const allowed = ['slug', 'icon', 'image', 'name', 'description', 'visible', 'order'];
  allowed.forEach((k) => {
    if (k in (req.body || {})) category[k] = req.body[k];
  });
  save();
  res.json(category);
});

router.delete('/categories/:id', requireAdmin, (req, res) => {
  const data = db();
  const i = data.categories.findIndex((c) => c.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not_found' });
  data.items = data.items.filter((item) => item.categoryId !== req.params.id);
  data.categories.splice(i, 1);
  save();
  res.json({ ok: true });
});

router.post('/categories/reorder', requireAdmin, (req, res) => {
  const data = db();
  (req.body.ids || []).forEach((id, index) => {
    const c = data.categories.find((x) => x.id === id);
    if (c) c.order = index + 1;
  });
  save();
  res.json({ ok: true });
});

/* ------------------------------------------------------------------- items */

router.get('/items', requireAdmin, (req, res) => {
  const data = db();
  const { categoryId } = req.query;
  let list = data.items;
  if (categoryId) list = list.filter((i) => i.categoryId === categoryId);
  res.json(list.slice().sort((a, b) => a.order - b.order));
});

router.post('/items', requireAdmin, (req, res) => {
  const data = db();
  const body = req.body || {};
  if (!data.categories.some((c) => c.id === body.categoryId)) {
    return res.status(400).json({ error: 'bad_category' });
  }
  const item = {
    id: uid('item'),
    categoryId: body.categoryId,
    name: body.name || { ru: '', en: '', uz: '' },
    description: body.description || { ru: '', en: '', uz: '' },
    price: Math.max(0, Number(body.price) || 0),
    weight: Number(body.weight) || 0,
    image: body.image || '',
    visible: body.visible !== false,
    popular: !!body.popular,
    order: data.items.filter((i) => i.categoryId === body.categoryId).length + 1,
  };
  data.items.push(item);
  save();
  res.status(201).json(item);
});

router.put('/items/:id', requireAdmin, (req, res) => {
  const data = db();
  const item = data.items.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'not_found' });
  const allowed = ['categoryId', 'name', 'description', 'price', 'weight', 'image', 'visible', 'popular', 'order'];
  allowed.forEach((k) => {
    if (k in (req.body || {})) item[k] = req.body[k];
  });
  item.price = Math.max(0, Number(item.price) || 0);
  save();
  res.json(item);
});

router.delete('/items/:id', requireAdmin, (req, res) => {
  const data = db();
  const i = data.items.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not_found' });
  data.items.splice(i, 1);
  save();
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ tables */

router.get('/tables', requireStaff, (req, res) => res.json(db().tables));

router.post('/tables', requireAdmin, (req, res) => {
  const data = db();
  const code = String(req.body.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'code_required' });
  if (data.tables.some((t) => t.code === code)) {
    return res.status(409).json({ error: 'duplicate_code' });
  }
  const table = {
    id: uid('tbl'),
    code,
    name: req.body.name || code,
    zone: req.body.zone || '',
    seats: Number(req.body.seats) || 4,
    active: req.body.active !== false,
  };
  data.tables.push(table);
  save();
  res.status(201).json(table);
});

router.put('/tables/:id', requireAdmin, (req, res) => {
  const data = db();
  const table = data.tables.find((t) => t.id === req.params.id);
  if (!table) return res.status(404).json({ error: 'not_found' });
  ['name', 'zone', 'seats', 'active'].forEach((k) => {
    if (k in (req.body || {})) table[k] = req.body[k];
  });
  save();
  res.json(table);
});

router.delete('/tables/:id', requireAdmin, (req, res) => {
  const data = db();
  const i = data.tables.findIndex((t) => t.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'not_found' });
  data.tables.splice(i, 1);
  save();
  res.json({ ok: true });
});

/* ---------------------------------------------------------------- settings */

router.get('/settings', requireAdmin, (req, res) => res.json(db().settings));

router.put('/settings', requireAdmin, (req, res) => {
  const data = db();
  const allowed = [
    'restaurantName', 'tagline', 'address', 'phone', 'currency', 'workingHours',
    'instagram', 'telegram', 'lat', 'lng', 'radiusMeters', 'maxAccuracyMeters',
    'geoRequired', 'orderingEnabled', 'requireTable', 'siteAccess', 'geoConfigured',
  ];
  allowed.forEach((k) => {
    if (k in (req.body || {})) data.settings[k] = req.body[k];
  });
  data.settings.lat = Number(data.settings.lat) || 0;
  data.settings.lng = Number(data.settings.lng) || 0;
  data.settings.radiusMeters = Math.max(10, Number(data.settings.radiusMeters) || 120);
  data.settings.maxAccuracyMeters = Math.max(10, Number(data.settings.maxAccuracyMeters) || 100);
  if (!['open', 'onsite'].includes(data.settings.siteAccess)) data.settings.siteAccess = 'open';
  // Saving real coordinates is what arms the geofence.
  if (data.settings.lat !== 0 || data.settings.lng !== 0) data.settings.geoConfigured = true;
  save();
  res.json(data.settings);
});

/* ------------------------------------------------------------------- users */

router.get('/users', requireAdmin, (req, res) => {
  res.json(db().users.map(({ passwordHash, ...rest }) => rest));
});

router.post('/users/password', requireStaff, (req, res) => {
  const data = db();
  const user = data.users.find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'not_found' });
  const { current, next } = req.body || {};
  if (!bcrypt.compareSync(String(current || ''), user.passwordHash)) {
    return res.status(403).json({ error: 'wrong_password' });
  }
  if (!next || String(next).length < 6) {
    return res.status(400).json({ error: 'weak_password' });
  }
  user.passwordHash = bcrypt.hashSync(String(next), 10);
  save();
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ upload */

router.post('/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no_file' });
  res.status(201).json({ url: '/uploads/' + req.file.filename });
});

/* --------------------------------------------------------------- dashboard */

router.get('/stats', requireStaff, (req, res) => {
  const data = db();
  const today = new Date().toISOString().slice(0, 10);
  const todays = data.orders.filter((o) => o.createdAt.slice(0, 10) === today);
  const revenue = todays
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const counter = {};
  data.orders.forEach((o) => {
    if (o.status === 'cancelled') return;
    o.items.forEach((l) => {
      counter[l.itemId] = counter[l.itemId] || { name: l.name, qty: 0, sum: 0 };
      counter[l.itemId].qty += l.qty;
      counter[l.itemId].sum += l.sum;
    });
  });
  const top = Object.values(counter).sort((a, b) => b.qty - a.qty).slice(0, 6);

  res.json({
    todayOrders: todays.length,
    todayRevenue: revenue,
    activeOrders: data.orders.filter((o) => ['new', 'accepted', 'cooking'].includes(o.status)).length,
    totalOrders: data.orders.length,
    itemCount: data.items.length,
    categoryCount: data.categories.length,
    tableCount: data.tables.length,
    averageCheck: todays.length ? Math.round(revenue / todays.length) : 0,
    top,
    recent: data.orders.slice(0, 6),
  });
});

module.exports = router;
