const jwt = require('jsonwebtoken');

const GEO_SECRET =
  process.env.GEO_SECRET || 'cult-geo-secret-change-me-in-production';
/** How long a verified in-restaurant position stays valid (seconds). */
const GEO_TTL = Number(process.env.GEO_TTL || 20 * 60);

/** Great-circle distance between two coordinates, in metres. */
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371008.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function isValidCoord(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

/**
 * Decides whether a reported position may order.
 * `accuracy` is the browser's reported radius of confidence in metres: a huge
 * accuracy value means the position came from IP/Wi-Fi triangulation rather
 * than GPS, so it is rejected even if the centre point looks close.
 */
function isConfigured(settings) {
  return (
    settings.geoConfigured === true &&
    Number.isFinite(Number(settings.lat)) &&
    Number.isFinite(Number(settings.lng)) &&
    !(Number(settings.lat) === 0 && Number(settings.lng) === 0)
  );
}

function evaluate(settings, { lat, lng, accuracy }) {
  const radius = Number(settings.radiusMeters) || 120;
  const maxAccuracy = Number(settings.maxAccuracyMeters) || 100;

  // Zone never set up — fail open rather than lock the owner out of their site.
  if (!isConfigured(settings)) {
    return { allowed: true, unconfigured: true, radius, distance: null };
  }

  if (!isValidCoord(lat, lng)) {
    return { allowed: false, reason: 'invalid', radius };
  }
  const distance = Math.round(
    distanceMeters(lat, lng, Number(settings.lat), Number(settings.lng))
  );
  const acc = Number.isFinite(accuracy) ? Math.round(accuracy) : null;

  if (acc !== null && acc > maxAccuracy) {
    return { allowed: false, reason: 'accuracy', distance, radius, accuracy: acc, maxAccuracy };
  }
  if (distance > radius) {
    return { allowed: false, reason: 'far', distance, radius, accuracy: acc };
  }
  return { allowed: true, distance, radius, accuracy: acc };
}

function issueToken(payload) {
  return jwt.sign(payload, GEO_SECRET, { expiresIn: GEO_TTL });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, GEO_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { distanceMeters, evaluate, issueToken, verifyToken, GEO_TTL, isValidCoord, isConfigured };
