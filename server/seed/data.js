const bcrypt = require('bcryptjs');

/* eslint-disable camelcase */

const t = (ru, en, uz) => ({ ru, en, uz });

const CATEGORIES = [
  {
    id: 'cat_sushi',
    slug: 'sushi',
    icon: 'sushi',
    image: '/images/cat-sushi.jpg',
    name: t('Суши и роллы', 'Sushi & Rolls', 'Sushi va rollar'),
    description: t(
      'Рис, рыба и выдержанный соевый соус — собираются под заказ.',
      'Rice, fish and aged soy — assembled to order.',
      'Guruch, baliq va soya sousi — buyurtma ostida tayyorlanadi.'
    ),
  },
  {
    id: 'cat_main',
    slug: 'main-dishes',
    icon: 'steak',
    image: '/images/cat-main.jpg',
    name: t('Горячие блюда', 'Main Dishes', 'Issiq taomlar'),
    description: t(
      'Открытый огонь, уголь и чугун.',
      'Open fire, charcoal and cast iron.',
      "Ochiq olov, ko'mir va cho'yan."
    ),
  },
  {
    id: 'cat_pizza',
    slug: 'pizza',
    icon: 'pizza',
    image: '/images/cat-pizza.jpg',
    name: t('Пицца', 'Pizza', 'Pitsa'),
    description: t(
      'Тесто холодной ферментации, дровяная печь.',
      'Cold-fermented dough, wood-fired oven.',
      'Sovuq fermentatsiyali xamir, olovli pech.'
    ),
  },
  {
    id: 'cat_pasta',
    slug: 'pasta-risotto',
    icon: 'bowl',
    image: '/images/cat-pasta.jpg',
    name: t('Паста и ризотто', 'Pasta & Risotto', 'Pasta va rizotto'),
    description: t(
      'Медленная кухня: бульоны, сыр, сливки.',
      'Slow kitchen: broths, cheese, cream.',
      'Sekin oshxona: bulyon, pishloq, qaymoq.'
    ),
  },
  {
    id: 'cat_salads',
    slug: 'salads',
    icon: 'leaf',
    image: '/images/cat-salads.jpg',
    name: t('Салаты', 'Salads', 'Salatlar'),
    description: t(
      'Зелень с локальных ферм, свежая заправка.',
      'Greens from local farms, dressed to order.',
      "Mahalliy fermalardan ko'katlar, yangi sous."
    ),
  },
  {
    id: 'cat_drinks',
    slug: 'drinks',
    icon: 'cocktail',
    image: '/images/cat-drinks.jpg',
    name: t('Напитки', 'Drinks', 'Ichimliklar'),
    description: t(
      'Авторский бар, чай и свежие фреши.',
      'Signature bar, tea and fresh juices.',
      'Mualliflik bar, choy va yangi sharbatlar.'
    ),
  },
  {
    id: 'cat_desserts',
    slug: 'desserts',
    icon: 'cake',
    image: '/images/cat-desserts.jpg',
    name: t('Десерты', 'Desserts', 'Shirinliklar'),
    description: t(
      'Шоколад, ягоды и работа кондитера.',
      'Chocolate, berries and pastry craft.',
      'Shokolad, rezavorlar va qandolatchi mahorati.'
    ),
  },
];

const RAW_ITEMS = [
  // --- sushi ---
  ['cat_sushi', 'Филадельфия классик', 'Philadelphia Classic', 'Filadelfiya klassik', 'Лосось, сливочный сыр, огурец, рис акита.', 'Salmon, cream cheese, cucumber, akita rice.', "Losos, qaymoqli pishloq, bodring, akita guruchi.", 68000, 240, 1],
  ['cat_sushi', 'Дракон ролл', 'Dragon Roll', 'Ajdaho roll', 'Угорь, авокадо, соус унаги, кунжут.', 'Eel, avocado, unagi sauce, sesame.', 'Ilonbaliq, avokado, unagi sousi, kunjut.', 92000, 265, 1],
  ['cat_sushi', 'Сет «Культ»', 'Cult Set', 'Kult seti', '32 кусочка: четыре ролла и нигири.', '32 pieces: four rolls and nigiri.', '32 boʻlak: toʻrt roll va nigiri.', 245000, 980, 1],
  ['cat_sushi', 'Нигири с лососем', 'Salmon Nigiri', 'Losos nigiri', 'Две штуки, лосось охлаждённый.', 'Two pieces, chilled salmon.', 'Ikki dona, sovutilgan losos.', 34000, 60, 0],
  ['cat_sushi', 'Спайси тунец', 'Spicy Tuna', 'Achchiq tunes', 'Тунец, острый майонез, зелёный лук.', 'Tuna, spicy mayo, spring onion.', 'Tunes, achchiq mayonez, koʻk piyoz.', 74000, 235, 0],
  // --- main ---
  ['cat_main', 'Рибай на углях', 'Charcoal Ribeye', 'Koʻmirda ribay', 'Мраморная говядина, розмарин, морская соль.', 'Marbled beef, rosemary, sea salt.', 'Marmar mol goʻshti, bibarsiya, dengiz tuzi.', 285000, 380, 1],
  ['cat_main', 'Каре ягнёнка', 'Rack of Lamb', 'Qoʻzichoq qovurgʻasi', 'Ягнёнок, чеснок, тимьян, красное вино.', 'Lamb, garlic, thyme, red wine.', 'Qoʻzichoq, sarimsoq, kiyik oʻti, qizil vino.', 240000, 340, 1],
  ['cat_main', 'Томлёная говяжья щека', 'Braised Beef Cheek', 'Dimlangan mol yonogʻi', 'Восемь часов в собственном соусе.', 'Eight hours in its own jus.', 'Oʻz sousida sakkiz soat.', 165000, 320, 0],
  ['cat_main', 'Дорадо на гриле', 'Grilled Dorado', 'Panjarada dorado', 'Целая рыба, лимон, оливковое масло.', 'Whole fish, lemon, olive oil.', 'Butun baliq, limon, zaytun moyi.', 178000, 400, 0],
  ['cat_main', 'Цыплёнок корнишон', 'Cornish Chicken', 'Korniş tovuq', 'Половина птицы, чесночное масло.', 'Half bird, garlic butter.', 'Yarim tovuq, sarimsoqli yogʻ.', 120000, 350, 0],
  // --- pizza ---
  ['cat_pizza', 'Маргарита', 'Margherita', 'Margarita', 'Томаты San Marzano, моцарелла, базилик.', 'San Marzano tomatoes, mozzarella, basil.', 'San Marzano pomidori, motsarella, rayhon.', 78000, 480, 1],
  ['cat_pizza', 'Пепперони', 'Pepperoni', 'Pepperoni', 'Острая салями, моцарелла, орегано.', 'Spicy salami, mozzarella, oregano.', 'Achchiq salyami, motsarella, oregano.', 95000, 520, 1],
  ['cat_pizza', 'Четыре сыра', 'Quattro Formaggi', 'Toʻrt pishloq', 'Горгонзола, пармезан, моцарелла, скаморца.', 'Gorgonzola, parmesan, mozzarella, scamorza.', 'Gorgondzola, parmezan, motsarella, skamortsa.', 112000, 500, 0],
  ['cat_pizza', 'Трюфельная', 'Truffle Pizza', 'Trufelli pitsa', 'Сливочная база, трюфельное масло, грибы.', 'Cream base, truffle oil, mushrooms.', 'Qaymoqli asos, trufel moyi, qoʻziqorin.', 138000, 510, 0],
  ['cat_pizza', 'Дьявола', 'Diavola', 'Diavola', 'Чили, салями, томат, моцарелла.', 'Chili, salami, tomato, mozzarella.', 'Chili, salyami, pomidor, motsarella.', 98000, 520, 0],
  // --- pasta ---
  ['cat_pasta', 'Трюфельное ризотто', 'Truffle Risotto', 'Trufelli rizotto', 'Карнароли, пармезан, чёрный трюфель.', 'Carnaroli, parmesan, black truffle.', 'Karnaroli, parmezan, qora trufel.', 155000, 320, 1],
  ['cat_pasta', 'Карбонара', 'Carbonara', 'Karbonara', 'Гуанчале, желток, пекорино, перец.', 'Guanciale, yolk, pecorino, pepper.', 'Guanchale, sariq, pekorino, qalampir.', 98000, 330, 1],
  ['cat_pasta', 'Паста с креветками', 'Prawn Linguine', 'Krevetkali lingvini', 'Тигровые креветки, чили, белое вино.', 'Tiger prawns, chili, white wine.', 'Yoʻlbars krevetkalari, chili, oq vino.', 145000, 340, 0],
  ['cat_pasta', 'Ризотто с грибами', 'Mushroom Risotto', 'Qoʻziqorinli rizotto', 'Белые грибы, шалот, сливки.', 'Porcini, shallot, cream.', 'Oq qoʻziqorin, shalot, qaymoq.', 118000, 320, 0],
  ['cat_pasta', 'Лазанья', 'Lasagna', 'Lazanya', 'Говяжий рагу, бешамель, пармезан.', 'Beef ragu, bechamel, parmesan.', 'Mol ragusi, beshamel, parmezan.', 105000, 380, 0],
  // --- salads ---
  ['cat_salads', 'Салат с тунцом', 'Seared Tuna Salad', 'Tunesli salat', 'Тунец, микс салат, кунжутная заправка.', 'Tuna, mixed leaves, sesame dressing.', 'Tunes, aralash salat, kunjut sousi.', 96000, 260, 1],
  ['cat_salads', 'Цезарь с курицей', 'Chicken Caesar', 'Tovuqli Sezar', 'Романо, пармезан, крутоны, анчоус.', 'Romaine, parmesan, croutons, anchovy.', 'Romano, parmezan, kruton, anchous.', 74000, 280, 1],
  ['cat_salads', 'Греческий', 'Greek Salad', 'Grek salati', 'Фета, оливки, огурец, орегано.', 'Feta, olives, cucumber, oregano.', 'Feta, zaytun, bodring, oregano.', 62000, 300, 0],
  ['cat_salads', 'Салат с бурратой', 'Burrata & Tomato', 'Burrata va pomidor', 'Буррата, томаты, базиликовое масло.', 'Burrata, tomatoes, basil oil.', 'Burrata, pomidor, rayhon moyi.', 108000, 270, 0],
  ['cat_salads', 'Тёплый салат с телятиной', 'Warm Veal Salad', 'Iliq buzoq salati', 'Телятина, руккола, вяленые томаты.', 'Veal, rocket, sun-dried tomatoes.', 'Buzoq goʻshti, rukkola, quritilgan pomidor.', 102000, 290, 0],
  // --- drinks ---
  ['cat_drinks', 'Культ Сигнатур', 'Cult Signature', 'Kult Signature', 'Авторский коктейль бара, безалкогольный.', 'Signature bar mix, alcohol-free.', 'Mualliflik bar aralashmasi, alkogolsiz.', 58000, 250, 1],
  ['cat_drinks', 'Свежевыжатый апельсин', 'Fresh Orange', 'Yangi apelsin sharbati', '300 мл, без сахара.', '300 ml, no sugar.', '300 ml, shakarsiz.', 38000, 300, 1],
  ['cat_drinks', 'Чай улун', 'Oolong Tea', 'Ulun choyi', 'Чайник на двоих, 600 мл.', 'Pot for two, 600 ml.', 'Ikki kishilik choynak, 600 ml.', 45000, 600, 0],
  ['cat_drinks', 'Эспрессо', 'Espresso', 'Espresso', 'Двойная порция, обжарка недели.', 'Double shot, roast of the week.', 'Ikki karra, haftaning qovurmasi.', 26000, 60, 0],
  ['cat_drinks', 'Лимонад базилик-лайм', 'Basil Lime Lemonade', 'Rayhon-laym limonadi', 'Домашний, 400 мл.', 'House-made, 400 ml.', 'Uy sharoitida, 400 ml.', 34000, 400, 0],
  // --- desserts ---
  ['cat_desserts', 'Шоколадная сфера', 'Chocolate Sphere', 'Shokolad sferasi', 'Тёмный шоколад, ягоды, горячий соус.', 'Dark chocolate, berries, hot sauce.', 'Qora shokolad, rezavorlar, issiq sous.', 78000, 180, 1],
  ['cat_desserts', 'Тирамису', 'Tiramisu', 'Tiramisu', 'Маскарпоне, савоярди, эспрессо.', 'Mascarpone, savoiardi, espresso.', 'Maskarpone, savoyardi, espresso.', 62000, 200, 1],
  ['cat_desserts', 'Чизкейк Нью-Йорк', 'New York Cheesecake', 'Nyu-York chizkeyki', 'Классический, ягодный соус.', 'Classic, berry coulis.', 'Klassik, rezavor sousi.', 58000, 190, 0],
  ['cat_desserts', 'Медовик', 'Honey Cake', 'Medovik', 'Двенадцать слоёв, сметанный крем.', 'Twelve layers, sour cream.', 'Oʻn ikki qatlam, smetana kremi.', 52000, 210, 0],
  ['cat_desserts', 'Панна котта', 'Panna Cotta', 'Panna kotta', 'Ваниль Бурбон, малина.', 'Bourbon vanilla, raspberry.', 'Burbon vanil, malina.', 54000, 170, 0],
];

function buildItems() {
  const perCategory = {};
  return RAW_ITEMS.map((row, index) => {
    const [categoryId, nRu, nEn, nUz, dRu, dEn, dUz, price, weight, popular] = row;
    perCategory[categoryId] = (perCategory[categoryId] || 0) + 1;
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    return {
      id: 'item_' + String(index + 1).padStart(3, '0'),
      categoryId,
      name: t(nRu, nEn, nUz),
      description: t(dRu, dEn, dUz),
      price,
      weight,
      image: cat ? cat.image : '',
      visible: true,
      popular: !!popular,
      order: perCategory[categoryId],
    };
  });
}

function buildTables() {
  const tables = [];
  ['A', 'B', 'C'].forEach((zone) => {
    for (let i = 1; i <= 6; i += 1) {
      tables.push({
        id: `tbl_${zone}${i}`,
        code: `${zone}${i}`,
        name: `${zone}${i}`,
        zone: zone === 'A' ? 'Зал' : zone === 'B' ? 'Терраса' : 'VIP',
        seats: zone === 'C' ? 6 : 4,
        active: true,
      });
    }
  });
  return tables;
}

module.exports = function seed() {
  return {
    settings: {
      restaurantName: 'CULT RESTAURANT',
      tagline: t('Вкус · Культура · Впечатление', 'Taste · Culture · Experience', 'Taʻm · Madaniyat · Taassurot'),
      address: t('Самарканд, Узбекистан', 'Samarkand, Uzbekistan', 'Samarqand, Oʻzbekiston'),
      phone: '+998 (00) 000-00-00',
      currency: 'сум',
      // Geofence. The zone is NOT configured out of the box: the owner sets it
      // with one tap ("Взять мои координаты") while standing in the dining room.
      // Until then every geo check is skipped, so a fresh install is never
      // locked out of its own site.
      geoConfigured: true,
      lat: 39.674798,
      lng: 66.929873,
      radiusMeters: 120,
      maxAccuracyMeters: 100,
      /* Защита пока выключена — сайт и заказ доступны всем, чтобы меню можно
         было показывать и проверять откуда угодно. Координаты ресторана уже
         записаны выше: чтобы включить защиту, достаточно вернуть эти два
         значения в админке (Настройки → Зона заказа). */
      geoRequired: false,
      // 'open'   — меню видно всем, заказ только в зале
      // 'onsite' — сайт целиком открывается только в зале
      siteAccess: 'open',
      orderingEnabled: true,
      requireTable: true,
      workingHours: '12:00 — 00:00',
      instagram: '',
      telegram: '',
    },
    categories: CATEGORIES.map((c, i) => ({ ...c, order: i + 1, visible: true })),
    items: buildItems(),
    tables: buildTables(),
    orders: [],
    users: [
      {
        id: 'usr_admin',
        username: 'admin',
        // Default credentials: admin / cult2026 — change them in the admin panel.
        passwordHash: bcrypt.hashSync('cult2026', 10),
        role: 'admin',
        name: 'Администратор',
      },
      {
        id: 'usr_waiter',
        username: 'waiter',
        passwordHash: bcrypt.hashSync('cult1234', 10),
        role: 'waiter',
        name: 'Официант',
      },
    ],
  };
};
