/**
 * Saytning menyusi — Supabase'dan.
 *
 * Supabase jadvallari (categories, products, restaurants) sayt
 * komponentlari kutgan ko'rinishga o'giriladi:
 *   categories → { id, slug, name, description, icon, image, order, visible, menuType }
 *   products   → { id, categoryId, name, description, price, image, popular, visible, order }
 */
import { RESTAURANT_ID, isSupabaseConfigured } from './supabase';
import { getCategories } from './categoriesApi';
import { getProducts } from './productsApi';
import { getRestaurant } from './restaurantsApi';
import { stockForCategory, stockForProduct, verifyImages } from './stockPhotos';

/* Kategoriya ikonkasi va rasmi: jadvalda bunday ustunlar yo'q, shuning uchun
   slug bo'yicha loyihadagi tayyor rasmlardan tanlanadi.
   [ikonka, rasm fayli] — public/images ichida. */
const LOOK_BY_SLUG = {
  salads: ['leaf', 'cat-salads.jpg'],
  'cold-starters': ['leaf', 'cat-salads.jpg'],
  'hot-starters': ['steak', 'cat-main.jpg'],
  soups: ['bowl', 'cat-pasta.jpg'],
  rolls: ['sushi', 'cat-sushi.jpg'],
  sushi: ['sushi', 'cat-sushi.jpg'],
  'pasta-main': ['bowl', 'cat-pasta.jpg'],
  burgers: ['steak', 'cat-main.jpg'],
  pizza: ['pizza', 'cat-pizza.jpg'],
  khachapuri: ['pizza', 'cat-pizza.jpg'],
  sides: ['bowl', 'cat-main.jpg'],
  'add-ons': ['bowl', 'cat-main.jpg'],
  desserts: ['cake', 'cat-desserts.jpg'],
  milkshakes: ['cake', 'cat-desserts.jpg'],
};

const LOOK_BY_TYPE = {
  bar: ['cocktail', 'cat-drinks.jpg'],
  kitchen: ['steak', 'cat-main.jpg'],
};

function lookOf(row) {
  return LOOK_BY_SLUG[row.slug] || LOOK_BY_TYPE[row.menu_type] || LOOK_BY_TYPE.kitchen;
}

function categoryImage(row) {
  return `${process.env.PUBLIC_URL || ''}/images/${lookOf(row)[1]}`;
}

function categoryIcon(row) {
  return lookOf(row)[0];
}

export function mapCategory(row) {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    slug: row.slug,
    name: row.name || '',
    description: row.note || '',
    menuType: row.menu_type || 'kitchen',
    icon: categoryIcon(row),
    image: categoryImage(row),
    order: row.sort_order ?? 0,
    visible: row.is_active !== false,
  };
}

/* Taomning o'z rasmi bo'lmasa (image_url = NULL) — kategoriya rasmi
   qo'yiladi, aks holda kartochka bo'sh yashil to'rtburchak bo'lib qoladi. */
export function mapProduct(row, fallbackImage) {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name || '',
    description: row.description || '',
    price: Number(row.price) || 0,
    image: row.image_url || fallbackImage || null,
    weight: row.weight || null,
    popular: !!row.is_featured,
    visible: row.is_active !== false,
    order: row.sort_order ?? 0,
  };
}

/* restaurants jadvalidagi ustun nomlari har xil bo'lishi mumkin —
   bor bo'lganini olamiz, bo'lmasa standart qiymat. */
function first(obj, keys, fallback) {
  if (obj) {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
    }
  }
  return fallback;
}

export function mapSettings(r) {
  return {
    restaurantName: first(r, ['name', 'title'], 'CULT RESTAURANT'),
    tagline: first(r, ['tagline', 'slogan'], {
      ru: 'Вкус · Культура · Впечатление',
      en: 'Taste · Culture · Experience',
      uz: 'Taʻm · Madaniyat · Taassurot',
    }),
    address: first(r, ['address'], {
      ru: 'Самарканд, Узбекистан',
      en: 'Samarkand, Uzbekistan',
      uz: 'Samarqand, Oʻzbekiston',
    }),
    phone: first(r, ['phone', 'phone_number'], ''),
    currency: first(r, ['currency'], 'сум'),
    workingHours: first(r, ['working_hours', 'workingHours', 'hours'], '12:00 — 00:00'),
    instagram: first(r, ['instagram'], ''),
    telegram: first(r, ['telegram'], ''),
    /* Buyurtma jadvali Supabase'da yo'q — menyu "vitrina" rejimida ishlaydi. */
    orderingEnabled: false,
    requireTable: false,
    geoRequired: false,
    geoConfigured: false,
    siteAccess: 'open',
  };
}

/** Список фото, скачанных npm run photos (если команду ещё не запускали — пусто). */
async function loadSavedPhotos() {
  const empty = { categories: {}, products: {} };
  try {
    const res = await fetch(`${process.env.PUBLIC_URL || ''}/images/dishes/manifest.json`, {
      cache: 'no-cache',
    });
    if (!res.ok) return empty;
    const data = await res.json();
    return {
      categories: (data && data.categories) || {},
      products: (data && data.products) || {},
    };
  } catch (err) {
    return empty;
  }
}

/** Butun menyu: { settings, categories, items, tables, locked, demo }. */
export async function fetchMenu() {
  if (!isSupabaseConfigured) throw new Error('supabase_not_configured');

  const categoriesRows = await getCategories(RESTAURANT_ID || undefined);

  const restaurantId =
    RESTAURANT_ID || (categoriesRows[0] && categoriesRows[0].restaurant_id) || undefined;

  const [productsRows, restaurant] = await Promise.all([
    getProducts(categoriesRows.map((c) => c.id)),
    getRestaurant(restaurantId).catch(() => null),
  ]);

  const categories = categoriesRows.map(mapCategory);
  const localImageOf = Object.fromEntries(categories.map((c) => [c.id, c.image]));
  const slugOf = Object.fromEntries(categories.map((c) => [c.id, c.slug]));

  /* Демо-фото с Unsplash (src/supabase/stockPhotos.js): у категории — по
     slug, у блюда без своего image_url — по названию. Своё фото из
     Supabase всегда главнее. */
  /* Фото, скачанные командой npm run photos, лежат в public/images —
     они главнее ссылок на Unsplash: грузятся быстрее и без чужого сервера. */
  const saved = await loadSavedPhotos();
  const base = `${process.env.PUBLIC_URL || ''}/images/`;

  categories.forEach((c) => {
    c.localImage = c.image;
    c.image = saved.categories[c.slug]
      ? base + saved.categories[c.slug]
      : stockForCategory(c.slug) || c.image;
  });
  const items = productsRows.map((row) => {
    const item = mapProduct(row, localImageOf[row.category_id]);
    item.localImage = localImageOf[row.category_id];
    if (!row.image_url) {
      item.image = saved.products[row.id]
        ? base + saved.products[row.id]
        : stockForProduct(row.name, slugOf[row.category_id], row.id) || item.image;
    }
    return item;
  });

  /* Фото, которое не загрузилось, заменяется локальным фото категории. */
  const ok = await verifyImages([...categories.map((c) => c.image), ...items.map((i) => i.image)]);
  const safe = (entry) => {
    if (/^https?:/.test(entry.image || '') && !ok.has(entry.image)) entry.image = entry.localImage;
  };
  categories.forEach(safe);
  items.forEach(safe);

  return {
    demo: true,
    locked: false,
    settings: mapSettings(restaurant),
    categories,
    items,
    tables: [],
  };
}

const menuApi = { fetchMenu };

export default menuApi;
