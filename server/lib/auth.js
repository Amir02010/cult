const jwt = require('jsonwebtoken');

const AUTH_SECRET =
  process.env.AUTH_SECRET || 'cult-admin-secret-change-me-in-production';
const TTL = process.env.AUTH_TTL || '12h';

function sign(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    AUTH_SECRET,
    { expiresIn: TTL }
  );
}

function read(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, AUTH_SECRET);
  } catch (err) {
    return null;
  }
}

/** Any signed-in staff member (admin or waiter). */
function requireStaff(req, res, next) {
  const user = read(req);
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  req.user = user;
  next();
}

/** Admin-only routes: menu, settings, staff. */
function requireAdmin(req, res, next) {
  const user = read(req);
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  req.user = user;
  next();
}

module.exports = { sign, read, requireStaff, requireAdmin };
