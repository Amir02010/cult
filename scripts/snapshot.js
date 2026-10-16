/**
 * Снимок меню для витрины.
 *
 * Собранный сайт можно выложить туда, где сервера нет вовсе — например на
 * Vercel. Без API меню было бы пустым, поэтому перед сборкой мы кладём рядом
 * со статикой обычный JSON с тем же содержимым, что отдаёт `GET /api/menu`.
 *
 * Снимок — только витрина: заказы и админка в нём не работают и работать не
 * должны. Цены в нём публичные, ничего приватного не попадает: пользователи,
 * пароли и координаты ресторана в файл не идут.
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'client', 'public', 'menu-snapshot.json');

function build() {
  /* Берём живую базу, если она есть: владелец мог переписать меню в админке,
     и витрина должна показывать именно её, а не исходную заготовку. */
  const dbFile = path.join(__dirname, '..', 'server', 'data', 'db.json');
  let state = null;

  if (fs.existsSync(dbFile)) {
    try {
      state = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    } catch (err) {
      console.warn('[snapshot] db.json нечитаем, беру исходное меню:', err.message);
    }
  }
  /* menuOnly — без логинов и паролей: тогда заготовке не нужен bcryptjs,
     а значит витрина собирается и там, где зависимости сервера не ставились. */
  if (!state) state = require('../server/seed/data')({ menuOnly: true });

  const s = state.settings || {};

  return {
    /* Признак витрины: клиент по нему понимает, что заказ недоступен. */
    demo: true,
    locked: false,
    settings: {
      restaurantName: s.restaurantName,
      tagline: s.tagline,
      address: s.address,
      phone: s.phone,
      currency: s.currency,
      workingHours: s.workingHours,
      instagram: s.instagram,
      telegram: s.telegram,
      /* Заказ выключен: принимать его некому. Координаты и радиус зоны
         намеренно не попадают в публичный файл. */
      orderingEnabled: false,
      requireTable: true,
      geoRequired: false,
      geoConfigured: false,
      siteAccess: 'open',
    },
    categories: (state.categories || []).filter((c) => c.visible !== false),
    items: (state.items || []).filter((i) => i.available !== false),
    tables: [],
  };
}

/* Витрина — удобство, а не условие работы сайта. Если снимок почему-то не
   собрался, сборка не должна падать: в репозитории лежит предыдущий файл, и
   он вполне годится. Молча ронять деплой из-за вспомогательного скрипта —
   худшее, что можно сделать. */
try {
  const data = build();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data), 'utf8');
  console.log(
    `[snapshot] ${path.relative(path.join(__dirname, '..'), OUT)} — ` +
      `${data.categories.length} категорий, ${data.items.length} блюд`
  );
} catch (err) {
  console.warn('[snapshot] не удалось собрать снимок меню:', err.message);
  if (fs.existsSync(OUT)) {
    console.warn('[snapshot] оставляю прежний файл из репозитория, сборка продолжается');
  } else {
    console.warn('[snapshot] снимка нет — сайт без сервера покажет ошибку связи');
  }
}
