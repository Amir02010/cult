const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const { db, load, persistNow } = require('./lib/db');
const auth = require('./lib/auth');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '1mb' }));

load();

/* ------------------------------------------------------------------- auth */

const attempts = new Map(); // naive brute-force brake, per IP

app.post('/api/auth/login', (req, res) => {
  const ip = req.ip || 'unknown';
  const record = attempts.get(ip) || { count: 0, until: 0 };
  if (record.until > Date.now()) {
    return res.status(429).json({ error: 'too_many_attempts' });
  }

  const { username, password } = req.body || {};
  const user = db().users.find(
    (u) => u.username.toLowerCase() === String(username || '').toLowerCase()
  );

  if (!user || !bcrypt.compareSync(String(password || ''), user.passwordHash)) {
    record.count += 1;
    if (record.count >= 6) {
      record.count = 0;
      record.until = Date.now() + 5 * 60 * 1000;
    }
    attempts.set(ip, record);
    return res.status(401).json({ error: 'bad_credentials' });
  }

  attempts.delete(ip);
  res.json({
    token: auth.sign(user),
    user: { id: user.id, username: user.username, role: user.role, name: user.name },
  });
});

app.get('/api/auth/me', auth.requireStaff, (req, res) => {
  const user = db().users.find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'not_found' });
  res.json({ id: user.id, username: user.username, role: user.role, name: user.name });
});

/* ----------------------------------------------------------------- routes */

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

/* ------------------------------------- serve the built CRA app in prod ---- */

const BUILD_DIR = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(BUILD_DIR)) {
  app.use(express.static(BUILD_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  });
}

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[api]', err.message);
  res.status(500).json({ error: 'server_error', message: err.message });
});

const server = app.listen(PORT, () => {
  console.log(`\n  CULT api    →  http://localhost:${PORT}/api`);
  console.log(`  admin login →  admin / cult2026\n`);
});

['SIGINT', 'SIGTERM'].forEach((sig) =>
  process.on(sig, () => {
    try {
      persistNow();
    } catch (err) {
      /* ignore */
    }
    server.close(() => process.exit(0));
  })
);
