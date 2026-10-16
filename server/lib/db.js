const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let state = null;
let writeTimer = null;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load() {
  ensureDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (err) {
      console.error('[db] db.json is corrupted, recreating from seed:', err.message);
      state = null;
    }
  }
  if (!state) {
    state = require('../seed/data')();
    persistNow();
  }
  // forward-compatible defaults
  const seed = require('../seed/data')();
  state.settings = Object.assign({}, seed.settings, state.settings);
  ['categories', 'items', 'tables', 'orders', 'users'].forEach((k) => {
    if (!Array.isArray(state[k])) state[k] = seed[k] || [];
  });
  migrate(seed);
  return state;
}

/* Разовые правки уже сохранённой базы.
   Настройки из db.json перекрывают значения из seed — иначе админ терял бы их
   при каждом обновлении. Но из-за этого база, созданная старой версией, вечно
   держит старые значения. Каждая миграция применяется один раз и помечается в
   state.meta.migrations, так что изменения админа потом не затираются. */
const MIGRATIONS = {
  /* Координаты ресторана заданы, а доступ открыт всем: так меню можно
     показывать и проверять откуда угодно, пока владелец не включит защиту. */
  'open-preview-2026-09': (s) => {
    s.settings.geoConfigured = true;
    if (!s.settings.lat) s.settings.lat = 39.674798;
    if (!s.settings.lng) s.settings.lng = 66.929873;
    s.settings.siteAccess = 'open';
    s.settings.geoRequired = false;
  },

  /* В ранних сборках координаты по умолчанию указывали на центр Ташкента —
     это была заглушка, а не выбор владельца. База, созданная тогда, хранит их
     до сих пор, и при включении зоны ресторан оказался бы в 270 км от неё.
     Заменяем заглушку на реальные координаты CULT в Самарканде. */
  'fix-tashkent-placeholder-2026-09': (s) => {
    const near = (a, b) => Math.abs(Number(a) - Number(b)) < 0.0005;
    if (near(s.settings.lat, 41.311081) && near(s.settings.lng, 69.240562)) {
      s.settings.lat = 39.674798;
      s.settings.lng = 66.929873;
      console.log('[db] координаты заменены на самаркандские: 39.674798, 66.929873');
    }
  },

  /* Ресторан находится в Самарканде. В старых базах и координаты, и адрес в
     подвале остались ташкентскими — правим и то и другое, иначе гость видит
     «Ташкент» под меню самаркандского заведения. */
  'samarkand-address-2026-09': (s) => {
    const city = /ташкент|tashkent|toshkent/i;
    const a = s.settings.address;
    const wrong =
      typeof a === 'string'
        ? city.test(a)
        : a && (city.test(a.ru || '') || city.test(a.en || '') || city.test(a.uz || ''));

    if (wrong) {
      s.settings.address = {
        ru: 'Самарканд, Узбекистан',
        en: 'Samarkand, Uzbekistan',
        uz: 'Samarqand, Oʻzbekiston',
      };
      console.log('[db] адрес исправлен на самаркандский');
    }

    /* Координаты обязаны указывать на Самарканд. Если в базе лежит что-то
       дальше 40 км от города — это наследие старых сборок, а не выбор
       владельца: точку из админки он ставит, стоя в зале. */
    const far =
      Math.abs(Number(s.settings.lat) - 39.674798) > 0.36 ||
      Math.abs(Number(s.settings.lng) - 66.929873) > 0.46;
    if (!Number(s.settings.lat) || far) {
      s.settings.lat = 39.674798;
      s.settings.lng = 66.929873;
      console.log('[db] координаты возвращены в Самарканд');
    }
  },

  /* Меню всё ещё нужно проверять с компьютера, а база могла остаться
     запертой после npm run lock. Открываем ещё раз — включить защиту можно
     одной командой npm run lock, когда проверка закончится. */
  'reopen-preview-2026-09': (s) => {
    s.settings.siteAccess = 'open';
    s.settings.geoRequired = false;
  },
};

function migrate() {
  if (!state.meta || typeof state.meta !== 'object') state.meta = {};
  if (!Array.isArray(state.meta.migrations)) state.meta.migrations = [];

  let changed = false;
  Object.keys(MIGRATIONS).forEach((name) => {
    if (state.meta.migrations.includes(name)) return;
    MIGRATIONS[name](state);
    state.meta.migrations.push(name);
    changed = true;
    console.log(`[db] применена миграция ${name}`);
  });
  if (changed) persistNow();
}

function db() {
  if (!state) load();
  return state;
}

function persistNow() {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
}

/** Debounced save — keeps writes cheap when the admin edits many fields quickly. */
function save() {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    writeTimer = null;
    try {
      persistNow();
    } catch (err) {
      console.error('[db] save failed:', err.message);
    }
  }, 120);
}

function uid(prefix) {
  return (
    (prefix ? prefix + '_' : '') +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

module.exports = { db, save, persistNow, load, uid, DB_FILE, DATA_DIR };
