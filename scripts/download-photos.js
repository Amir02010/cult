#!/usr/bin/env node
/**
 * npm run photos — скачивает демо-фото для всего меню и раскладывает их.
 *
 * Что делает:
 *   1. Берёт из Supabase все активные категории и блюда (ключи — из
 *      client/.env.development или client/.env).
 *   2. Для каждого блюда подбирает фото по названию, для категории — по slug
 *      (те же правила, что на сайте: client/src/supabase/stockPhotos.js).
 *   3. Скачивает фото с Unsplash (бесплатная лицензия) и сохраняет:
 *        client/public/images/dishes/<id блюда>.jpg       ← сайт берёт отсюда сам
 *        client/public/images/categories/<slug>.jpg
 *        client/public/images/dishes/manifest.json        ← список, что где лежит
 *        cult-photos/<NN Категория>/<Блюдо>.jpg            ← понятные имена
 *        cult-photos.zip                                   ← архив для админки
 *
 * Повторный запуск докачивает только то, чего ещё нет.
 * Блюда, у которых в Supabase уже есть своё фото (image_url), пропускаются.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PUBLIC_IMAGES = path.join(ROOT, 'client', 'public', 'images');
const DISHES_DIR = path.join(PUBLIC_IMAGES, 'dishes');
const CATS_DIR = path.join(PUBLIC_IMAGES, 'categories');
const NAMED_DIR = path.join(ROOT, 'cult-photos');
const ZIP_FILE = path.join(ROOT, 'cult-photos.zip');

/* ------------------------------------------------------------- env */

function readEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  });
  return out;
}

const env = {
  ...readEnv(path.join(ROOT, 'client', '.env')),
  ...readEnv(path.join(ROOT, 'client', '.env.development')),
  ...process.env,
};
const SUPABASE_URL = (env.REACT_APP_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY = env.REACT_APP_SUPABASE_ANON_KEY || '';
const RESTAURANT_ID = env.REACT_APP_RESTAURANT_ID || '';

/* ------------------------------------------- правила подбора фото */

/* Берём тот же файл, что использует сайт, чтобы фото совпадали. Он написан
   как модуль браузера (export), поэтому загружаем его как обычный код. */
function loadStock() {
  const file = path.join(ROOT, 'client', 'src', 'supabase', 'stockPhotos.js');
  const src = fs.readFileSync(file, 'utf8').replace(/^export\s+/gm, '');
  // eslint-disable-next-line no-new-func
  return new Function(`${src}\nreturn { stockForCategory, stockForProduct };`)();
}

/* ---------------------------------------------------------- helpers */

const clean = (s) =>
  String(s || '')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'photo';

const jpg = (url) => url.replace(/([?&])auto=format/, '$1fm=jpg');

async function supabase(query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

const cache = new Map();
async function download(url) {
  if (cache.has(url)) return cache.get(url);
  const job = (async () => {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const res = await fetch(jpg(url), { redirect: 'follow' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const type = res.headers.get('content-type') || '';
        if (!type.startsWith('image/')) throw new Error(`не картинка (${type})`);
        return Buffer.from(await res.arrayBuffer());
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 800 * attempt));
      }
    }
    return null;
  })();
  cache.set(url, job);
  return job;
}

function ensure(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function makeZip() {
  if (fs.existsSync(ZIP_FILE)) fs.unlinkSync(ZIP_FILE);
  try {
    if (process.platform === 'win32') {
      execFileSync('powershell', [
        '-NoProfile', '-Command',
        `Compress-Archive -Path '${NAMED_DIR}\\*' -DestinationPath '${ZIP_FILE}' -Force`,
      ], { stdio: 'ignore' });
    } else {
      execFileSync('zip', ['-rq', ZIP_FILE, '.'], { cwd: NAMED_DIR, stdio: 'ignore' });
    }
    return true;
  } catch (err) {
    return false;
  }
}

/* ------------------------------------------------------------- main */

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Нет ключей Supabase: проверьте client/.env.development');
    process.exit(1);
  }
  const { stockForCategory, stockForProduct } = loadStock();

  console.log('Читаю меню из Supabase…');
  const rid = RESTAURANT_ID ? `&restaurant_id=eq.${RESTAURANT_ID}` : '';
  const categories = await supabase(`categories?select=*&is_active=eq.true${rid}&order=sort_order.asc`);
  const ids = categories.map((c) => c.id).join(',');
  const products = ids
    ? await supabase(`products?select=*&is_active=eq.true&category_id=in.(${ids})&order=sort_order.asc`)
    : [];
  console.log(`  ${categories.length} категорий, ${products.length} блюд\n`);

  [DISHES_DIR, CATS_DIR, NAMED_DIR].forEach(ensure);
  const manifestFile = path.join(DISHES_DIR, 'manifest.json');
  const manifest = fs.existsSync(manifestFile)
    ? JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
    : { categories: {}, products: {} };

  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
  let ok = 0;
  let skipped = 0;
  const failed = [];

  /* категории */
  for (const [i, c] of categories.entries()) {
    const url = stockForCategory(c.slug);
    const folder = path.join(NAMED_DIR, `${String(i + 1).padStart(2, '0')} ${clean(c.name)}`);
    ensure(folder);
    if (!url) {
      skipped += 1;
      continue;
    }
    const target = path.join(CATS_DIR, `${c.slug}.jpg`);
    try {
      const buf = fs.existsSync(target) ? fs.readFileSync(target) : await download(url);
      fs.writeFileSync(target, buf);
      fs.writeFileSync(path.join(folder, `_категория ${clean(c.name)}.jpg`), buf);
      manifest.categories[c.slug] = `categories/${c.slug}.jpg`;
      ok += 1;
      process.stdout.write(`  ✓ категория: ${c.name}\n`);
    } catch (err) {
      failed.push(`категория «${c.name}» — ${err.message}`);
    }
  }

  /* блюда */
  for (const p of products) {
    const cat = catById[p.category_id];
    if (p.image_url) {
      skipped += 1;
      continue;
    }
    const url = stockForProduct(p.name, cat && cat.slug, p.id);
    if (!url) {
      skipped += 1;
      continue;
    }
    const index = categories.indexOf(cat);
    const folder = path.join(NAMED_DIR, `${String(index + 1).padStart(2, '0')} ${clean(cat && cat.name)}`);
    const target = path.join(DISHES_DIR, `${p.id}.jpg`);
    try {
      const buf = fs.existsSync(target) ? fs.readFileSync(target) : await download(url);
      fs.writeFileSync(target, buf);
      fs.writeFileSync(path.join(folder, `${clean(p.name)}.jpg`), buf);
      manifest.products[p.id] = `dishes/${p.id}.jpg`;
      ok += 1;
      process.stdout.write(`  ✓ ${p.name}\n`);
    } catch (err) {
      failed.push(`«${p.name}» — ${err.message}`);
    }
  }

  manifest.updatedAt = new Date().toISOString();
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), 'utf8');

  const zipped = makeZip();

  console.log('\n────────────────────────────────────────');
  console.log(`Готово: ${ok} фото.`);
  if (skipped) console.log(`Пропущено: ${skipped} (своё фото в Supabase или нет подходящего).`);
  if (failed.length) {
    console.log(`Не скачалось: ${failed.length}:`);
    failed.forEach((f) => console.log('  ✗ ' + f));
    console.log('Запустите npm run photos ещё раз — докачается только это.');
  }
  console.log('\nФото уже на своих местах — обновите сайт в браузере.');
  console.log(`Папка с понятными именами: ${path.relative(ROOT, NAMED_DIR)}`);
  if (zipped) console.log(`Архив: ${path.relative(ROOT, ZIP_FILE)}`);
}

main().catch((err) => {
  console.error('\nОшибка:', err.message);
  process.exit(1);
});
