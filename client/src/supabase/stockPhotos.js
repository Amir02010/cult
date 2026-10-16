/**
 * Демо-фото для меню — бесплатные снимки с Unsplash (unsplash.com/license:
 * можно использовать в коммерческих проектах без указания автора).
 *
 * Нужны, пока у блюд нет своих фото: если в Supabase у блюда заполнен
 * image_url, показывается он, а не эти картинки.
 *
 * Фото подбирается по названию блюда (пицца → пицца, кофе → кофе),
 * а если слово не узнано — по категории.
 */

const U = (id) =>
  `https://images.unsplash.com/photo-${id}?w=900&q=70&auto=format&fit=crop`;

export const STOCK = {
  salad: ['1546069901-ba9599a7e63c', '1512621776951-a57141f2eefd', '1540189549336-e6e99c3679fe'],
  starter: ['1541529086526-db283c563270', '1540189549336-e6e99c3679fe'],
  pizza: [
    '1565299624946-b28f40a0ae38', '1513104890138-7c749659a591', '1574071318508-1cdbab80d002',
    '1534308983496-4fabb1a015ee', '1628840042765-356cda07504e', '1593560708920-61dd98c46a4e',
  ],
  burger: [
    '1568901346375-23c9450c58cd', '1571091718767-18b5b1457add', '1607013251379-e6eecfffe234',
    '1550547660-d9450f859349', '1572802419224-296b0aeee0d9', '1586190848861-99aa4a171e90',
  ],
  fries: ['1573080496219-bb080dd4f877', '1551782450-a2132b4ba21d', '1594212699903-ec8a3eca50f5'],
  sushi: ['1579871494447-9811cf80d66c', '1553621042-f6e147245754'],
  pasta: ['1621996346565-e3dbc646d9a9', '1473093295043-cdd812d0e601', '1563379926898-05f4575a45d8'],
  noodles: ['1569718212165-3a8278d5f624'],
  steak: ['1600891964092-4316c288032e', '1546964124-0cce460f38ef'],
  soup: ['1547592180-85f173990554'],
  dessert: ['1578985545062-69928b1d9587'],
  coffee: ['1509042239860-f550ce710b93', '1495474472287-4d71bcdd2085', '1541167760496-1628856ab772'],
  icedCoffee: ['1461023058943-07fcbe16d735', '1517701550927-30cf4ba1dba5'],
  tea: ['1544787219-7f47ccb76574', '1576092768241-dec231879fc3'],
  juice: ['1600271886742-f049cd451bba', '1613478223719-2ab802602423'],
  lemonade: ['1621263764928-df1444c5e859', '1523371054106-bbf80586c38c'],
  milkshake: ['1572490122747-3968b75cc699', '1577805947697-89e18249d767'],
  hotChocolate: ['1542990253-0d0f5be5f0ed'],
  cocktail: [
    '1514362545857-3bc16c4c7d1b', '1551024709-8f23befc6f87',
    '1470337458703-46ad1756a187', '1536935338788-846bb9981813',
  ],
};

/* Слово в названии блюда → группа фото. Порядок важен: «айс-кофе» должен
   найтись раньше, чем просто «кофе». */
const BY_NAME = [
  [/пицц|пеппер|маргарит/i, 'pizza'],
  [/бургер/i, 'burger'],
  [/фри\b|картоф/i, 'fries'],
  [/ролл|филадельф|калифорн|суши|сашими/i, 'sushi'],
  [/лапш|рамен|удон/i, 'noodles'],
  [/паст|альфредо|карбонар|болоньез/i, 'pasta'],
  [/стейк|филе|рибай|мясо|говяд|телят|баран/i, 'steak'],
  [/суп|борщ|солянк|шурп/i, 'soup'],
  [/салат/i, 'salad'],
  [/айс|фрапп|холодн.*кофе/i, 'icedCoffee'],
  [/милкшейк|шейк/i, 'milkshake'],
  [/какао|горяч.*шоколад/i, 'hotChocolate'],
  [/кофе|капуч|американо|латте|эспрессо|раф\b|флэт/i, 'coffee'],
  [/чай|пуэр|пуэр|улун|пао|бергамот/i, 'tea'],
  [/лимонад/i, 'lemonade'],
  [/сок|фреш|апельсин|морков|сельдер|яблок/i, 'juice'],
  [/коктейл|сауэр|либре|коллинз|мартини|негрони|спритц|мохито|маргарита|олд фэшн/i, 'cocktail'],
  [/торт|чизкейк|десерт|тирамису|медовик/i, 'dessert'],
];

/* Категория (slug) → группа, если по названию блюда ничего не нашлось. */
const BY_SLUG = {
  salads: 'salad',
  'cold-starters': 'starter',
  'hot-starters': 'starter',
  soups: 'soup',
  rolls: 'sushi',
  'pasta-main': 'pasta',
  burgers: 'burger',
  pizza: 'pizza',
  sides: 'fries',
  lemonades: 'lemonade',
  'fresh-juices': 'juice',
  milkshakes: 'milkshake',
  'not-coffee': 'hotChocolate',
  coffee: 'coffee',
  'iced-coffee': 'icedCoffee',
  tea: 'tea',
  'chinese-tea': 'tea',
  'special-tea': 'tea',
  'classic-cocktails': 'cocktail',
  'fresh-cocktails': 'cocktail',
  'cult-cocktails': 'cocktail',
  desserts: 'dessert',
};

/* Какое фото из группы взять для карточки категории — чтобы соседние
   категории одной группы (три вида чая, три вида коктейлей) не повторялись. */
const CATEGORY_PICK = {
  'cold-starters': 0, 'hot-starters': 1, 'special-tea': 1, 'chinese-tea': 0, tea: 1,
  'fresh-cocktails': 1, 'cult-cocktails': 2, 'classic-cocktails': 0,
};

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % 100003;
  return h;
}

function groupForName(name) {
  const hit = BY_NAME.find(([re]) => re.test(name || ''));
  return hit ? hit[1] : null;
}

/** Фото для карточки категории (или null — тогда остаётся локальное). */
export function stockForCategory(slug) {
  const group = BY_SLUG[slug];
  if (!group) return null;
  const list = STOCK[group];
  return U(list[(CATEGORY_PICK[slug] || 0) % list.length]);
}

/** Фото для блюда: сначала по названию, потом по категории. */
export function stockForProduct(name, slug, id) {
  const group = groupForName(name) || BY_SLUG[slug];
  if (!group) return null;
  const list = STOCK[group];
  return U(list[hash(id || name || '') % list.length]);
}

/**
 * Проверяет, что внешние фото реально загружаются. Не загрузилось за
 * несколько секунд (нет сети, фото удалили) — заменяем на локальное фото
 * категории, чтобы на сайте не было пустых карточек.
 */
export async function verifyImages(urls, timeoutMs = 4000) {
  const unique = [...new Set(urls.filter((u) => u && /^https?:/.test(u)))];
  if (typeof Image === 'undefined') return new Set(unique);
  const results = await Promise.all(
    unique.map(
      (url) =>
        new Promise((resolve) => {
          const img = new Image();
          const timer = setTimeout(() => resolve([url, false]), timeoutMs);
          img.onload = () => {
            clearTimeout(timer);
            resolve([url, true]);
          };
          img.onerror = () => {
            clearTimeout(timer);
            resolve([url, false]);
          };
          img.src = url;
        })
    )
  );
  return new Set(results.filter(([, ok]) => ok).map(([url]) => url));
}
