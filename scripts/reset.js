/**
 * npm run reset — удаляет server/data/db.json.
 *
 * База создастся заново из seed при следующем запуске: исходное меню, столы,
 * логины и открытый доступ. Заказы и правки в админке при этом теряются,
 * поэтому старый файл сохраняется рядом с отметкой времени.
 */
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'server', 'data', 'db.json');

if (!fs.existsSync(DB_FILE)) {
  console.log('База и так отсутствует — при запуске создастся новая.');
  process.exit(0);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backup = DB_FILE.replace(/\.json$/, `.backup-${stamp}.json`);
fs.renameSync(DB_FILE, backup);

console.log('Готово. Старая база сохранена как:');
console.log('  ' + backup);
console.log('Запустите npm start — база создастся заново.');
