/**
 * Быстрый переключатель доступа, чтобы не искать нужные поля руками.
 *
 *   npm run open   — меню открыто всем, заказ без проверки геопозиции
 *   npm run lock   — сайт и заказ работают только в зале ресторана
 *
 * Сервер читает db.json при старте, поэтому после команды его нужно
 * перезапустить (Ctrl+C и снова npm start).
 */
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'server', 'data', 'db.json');
const mode = (process.argv[2] || '').toLowerCase();

if (mode !== 'open' && mode !== 'lock') {
  console.log('Использование: npm run open  |  npm run lock');
  process.exit(1);
}

if (!fs.existsSync(DB_FILE)) {
  console.log('База ещё не создана — она появится при первом запуске сервера.');
  console.log('Свежая база уже открыта для всех, ничего делать не нужно.');
  process.exit(0);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
} catch (err) {
  console.error('Не удалось прочитать db.json:', err.message);
  console.error('Удалите файл server/data/db.json — база создастся заново.');
  process.exit(1);
}

data.settings = data.settings || {};

if (mode === 'open') {
  data.settings.siteAccess = 'open';
  data.settings.geoRequired = false;
} else {
  const near = (a, b) => Math.abs(Number(a) - Number(b)) < 0.0005;
  /* 41.311081, 69.240562 — центр Ташкента: заглушка из ранних сборок.
     Включать зону вокруг неё бессмысленно, ресторан в 270 км. */
  const placeholder = near(data.settings.lat, 41.311081) && near(data.settings.lng, 69.240562);

  data.settings.geoConfigured = true;
  if (!data.settings.lat || placeholder) data.settings.lat = 39.674798;
  if (!data.settings.lng || placeholder) data.settings.lng = 66.929873;
  if (!data.settings.radiusMeters) data.settings.radiusMeters = 120;
  data.settings.siteAccess = 'onsite';
  data.settings.geoRequired = true;
}

fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');

console.log(
  mode === 'open'
    ? 'Готово: меню открыто всем, заказ принимается без проверки геопозиции.'
    : `Готово: сайт и заказ работают только в радиусе ${data.settings.radiusMeters} м от ` +
      `точки ${data.settings.lat}, ${data.settings.lng}.`
);
console.log('Перезапустите сервер, чтобы изменения вступили в силу.');
