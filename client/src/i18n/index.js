export const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'uz', label: 'UZ' },
];

export const DEFAULT_LANG = 'ru';

const dict = {
  'nav.menu': { ru: 'Меню', en: 'Menu', uz: 'Menyu' },
  'nav.onlineMenu': { ru: 'Онлайн-меню', en: 'Online Menu', uz: 'Onlayn menyu' },
  'nav.about': { ru: 'О ресторане', en: 'About', uz: 'Restoran haqida' },
  'nav.contacts': { ru: 'Контакты', en: 'Contacts', uz: 'Kontaktlar' },
  'nav.cart': { ru: 'Корзина', en: 'Cart', uz: 'Savat' },
  'nav.search': { ru: 'Поиск', en: 'Search', uz: 'Qidiruv' },
  'nav.close': { ru: 'Закрыть', en: 'Close', uz: 'Yopish' },
  'nav.admin': { ru: 'Панель управления', en: 'Admin panel', uz: 'Boshqaruv paneli' },

  'hero.welcome': { ru: 'Добро пожаловать в', en: 'Welcome to', uz: 'Xush kelibsiz' },
  'hero.explore': { ru: 'Открыть меню', en: 'Explore menu', uz: 'Menyuni ochish' },
  'hero.moreThanFood': { ru: 'Больше, чем еда', en: 'More than food', uz: 'Taomdan ham ortiq' },
  'hero.itsCult': { ru: 'Это CULT', en: "It's CULT", uz: 'Bu CULT' },

  'menu.title': { ru: 'Меню', en: 'Menu', uz: 'Menyu' },
  'menu.all': { ru: 'Всё меню', en: 'Full menu', uz: 'Butun menyu' },
  'menu.popular': { ru: 'Хит', en: 'Signature', uz: 'Xit' },
  'menu.empty': { ru: 'В этой категории пока нет блюд', en: 'No dishes in this category yet', uz: 'Bu turkumda hozircha taom yo‘q' },
  'menu.add': { ru: 'В корзину', en: 'Add to cart', uz: 'Savatga' },
  'menu.added': { ru: 'Добавлено', en: 'Added', uz: 'Qo‘shildi' },
  'menu.back': { ru: 'Назад в меню', en: 'Back to menu', uz: 'Menyuga qaytish' },
  'menu.positions': { ru: 'позиций', en: 'dishes', uz: 'taom' },
  'menu.searchPlaceholder': { ru: 'Название блюда…', en: 'Dish name…', uz: 'Taom nomi…' },
  'menu.nothingFound': { ru: 'Ничего не найдено', en: 'Nothing found', uz: 'Hech narsa topilmadi' },

  'cart.title': { ru: 'Ваш заказ', en: 'Your order', uz: 'Buyurtmangiz' },
  'cart.empty': { ru: 'Корзина пуста', en: 'Your cart is empty', uz: 'Savat bo‘sh' },
  'cart.emptyHint': { ru: 'Выберите блюда из меню', en: 'Pick something from the menu', uz: 'Menyudan taom tanlang' },
  'cart.total': { ru: 'Итого', en: 'Total', uz: 'Jami' },
  'cart.clear': { ru: 'Очистить', en: 'Clear', uz: 'Tozalash' },
  'cart.checkout': { ru: 'Оформить заказ', en: 'Place order', uz: 'Buyurtma berish' },
  'cart.table': { ru: 'Номер столика', en: 'Table number', uz: 'Stol raqami' },
  'cart.tablePick': { ru: 'Выберите столик', en: 'Select a table', uz: 'Stolni tanlang' },
  'cart.name': { ru: 'Имя (необязательно)', en: 'Name (optional)', uz: 'Ism (ixtiyoriy)' },
  'cart.comment': { ru: 'Комментарий к заказу', en: 'Order note', uz: 'Buyurtmaga izoh' },
  'cart.commentHint': { ru: 'Аллергии, пожелания по подаче…', en: 'Allergies, serving notes…', uz: 'Allergiya, taqdim etish istaklari…' },
  'cart.sending': { ru: 'Отправляем…', en: 'Sending…', uz: 'Yuborilmoqda…' },

  'geo.checking': { ru: 'Определяем ваше местоположение…', en: 'Checking your location…', uz: 'Joylashuvingiz aniqlanmoqda…' },
  'geo.inside': { ru: 'Вы в ресторане', en: 'You are at the restaurant', uz: 'Siz restorandasiz' },
  'geo.insideHint': { ru: 'Заказ доступен', en: 'Ordering is available', uz: 'Buyurtma mavjud' },
  'geo.outside': { ru: 'Заказ доступен только в ресторане', en: 'Ordering works inside the restaurant only', uz: 'Buyurtma faqat restoran ichida' },
  'geo.outsideHint': {
    ru: 'Вы находитесь слишком далеко от зала. Меню можно смотреть, но оформить заказ получится только за столиком.',
    en: 'You are too far from the dining room. You can browse the menu, but ordering is only possible at a table.',
    uz: 'Siz zaldan juda uzoqdasiz. Menyuni ko‘rish mumkin, lekin buyurtma faqat stolda beriladi.',
  },
  'geo.denied': { ru: 'Доступ к геолокации запрещён', en: 'Location access denied', uz: 'Joylashuvga ruxsat berilmadi' },
  'geo.deniedHint': {
    ru: 'Разрешите доступ к геопозиции в настройках браузера — без него заказ оформить нельзя.',
    en: 'Allow location access in your browser settings — ordering is not possible without it.',
    uz: 'Brauzer sozlamalarida joylashuvga ruxsat bering — usiz buyurtma berib bo‘lmaydi.',
  },
  'geo.unsupported': { ru: 'Браузер не поддерживает геолокацию', en: 'Your browser does not support geolocation', uz: 'Brauzeringiz geolokatsiyani qo‘llab-quvvatlamaydi' },
  'geo.accuracy': { ru: 'Слишком низкая точность геопозиции', en: 'Location accuracy is too low', uz: 'Joylashuv aniqligi juda past' },
  'geo.accuracyHint': {
    ru: 'Включите GPS и отключите режим экономии данных, затем повторите проверку.',
    en: 'Turn on GPS, disable data-saving mode and check again.',
    uz: 'GPS ni yoqing, ma’lumot tejash rejimini o‘chiring va qayta tekshiring.',
  },
  'gate.checking': { ru: 'Проверяем, что вы в ресторане…', en: 'Checking that you are at the restaurant…', uz: 'Restoranda ekanligingiz tekshirilmoqda…' },
  'gate.outside': { ru: 'Меню доступно только в ресторане', en: 'The menu is available inside the restaurant only', uz: 'Menyu faqat restoran ichida mavjud' },
  'gate.outsideHint': {
    ru: 'Откройте эту страницу за столиком в зале — меню появится автоматически. Ждём вас в гости.',
    en: 'Open this page at a table in the dining room and the menu will appear automatically. See you soon.',
    uz: 'Ushbu sahifani zaldagi stolda oching — menyu avtomatik ochiladi. Sizni kutamiz.',
  },
  'gate.deniedHint': {
    ru: 'Разрешите доступ к геопозиции в настройках браузера и обновите страницу. Если не получается — попросите меню у официанта.',
    en: 'Allow location access in your browser settings and reload. If it still fails, ask your waiter for the menu.',
    uz: 'Brauzer sozlamalarida joylashuvga ruxsat bering va sahifani yangilang. Ishlamasa, ofitsiantdan menyuni so‘rang.',
  },
  'gate.welcome': { ru: 'Добро пожаловать — открываем меню', en: 'Welcome — opening the menu', uz: 'Xush kelibsiz — menyu ochilmoqda' },
  'gate.error': { ru: 'Не удалось определить местоположение', en: 'Could not determine your location', uz: 'Joylashuvni aniqlab bo‘lmadi' },

  'geo.retry': { ru: 'Проверить снова', en: 'Check again', uz: 'Qayta tekshirish' },
  'geo.distance': { ru: 'Расстояние до ресторана', en: 'Distance to the restaurant', uz: 'Restorangacha masofa' },
  'geo.browse': { ru: 'Просто смотреть меню', en: 'Just browse the menu', uz: 'Shunchaki menyuni ko‘rish' },
  'geo.radius': { ru: 'радиус зала', en: 'dining-room radius', uz: 'zal radiusi' },
  'geo.badgeOn': { ru: 'В зале', en: 'In-house', uz: 'Zalda' },
  'geo.badgeOff': { ru: 'Вне зоны', en: 'Out of range', uz: 'Hudud tashqarisida' },
  'geo.required': { ru: 'Подтвердите, что вы в ресторане', en: 'Confirm you are at the restaurant', uz: 'Restorandaligingizni tasdiqlang' },

  'order.accepted': { ru: 'Заказ принят', en: 'Order placed', uz: 'Buyurtma qabul qilindi' },
  'order.number': { ru: 'Номер заказа', en: 'Order number', uz: 'Buyurtma raqami' },
  'order.status': { ru: 'Статус', en: 'Status', uz: 'Holat' },
  'order.status.new': { ru: 'Передан официанту', en: 'Sent to the waiter', uz: 'Ofitsiantga yuborildi' },
  'order.status.accepted': { ru: 'Принят', en: 'Accepted', uz: 'Qabul qilindi' },
  'order.status.cooking': { ru: 'Готовится', en: 'Cooking', uz: 'Tayyorlanmoqda' },
  'order.status.served': { ru: 'Подан', en: 'Served', uz: 'Berildi' },
  'order.status.cancelled': { ru: 'Отменён', en: 'Cancelled', uz: 'Bekor qilindi' },
  'order.newOrder': { ru: 'Сделать ещё заказ', en: 'Order again', uz: 'Yana buyurtma berish' },
  'order.thanks': {
    ru: 'Официант подтвердит заказ и принесёт его к вашему столику.',
    en: 'The waiter will confirm your order and bring it to your table.',
    uz: 'Ofitsiant buyurtmani tasdiqlaydi va stolingizga olib keladi.',
  },

  /* --- Согласие перед входом ---------------------------------------------
     Тон: спокойный и уважительный, но формулировки точные — это правила, а
     не рекламный текст. Гость должен понять две вещи: состав заказа на нём,
     а отмена после подтверждения идёт через администратора. */
  'consent.title': {
    ru: 'Прежде чем начать',
    en: 'Before you begin',
    uz: 'Boshlashdan oldin',
  },
  'consent.lead': {
    ru: 'Мы рады видеть вас в CULT. Пожалуйста, уделите полминуты — ниже собрано всё, что важно знать о заказе через это меню.',
    en: 'We are glad to have you at CULT. Please take half a minute — everything worth knowing about ordering through this menu is below.',
    uz: 'CULT’da sizni ko‘rganimizdan xursandmiz. Yarim daqiqa vaqt ajrating — ushbu menyu orqali buyurtma berish haqida bilish kerak bo‘lgan hamma narsa quyida.',
  },
  'consent.p1.title': {
    ru: 'Заказ уходит на кухню сразу',
    en: 'Your order goes to the kitchen at once',
    uz: 'Buyurtma darhol oshxonaga tushadi',
  },
  'consent.p1.text': {
    ru: 'Нажимая «Оформить заказ», вы подтверждаете состав и количество блюд. Проверьте корзину перед отправкой — дальше заказ принимает официант.',
    en: 'By tapping “Place order” you confirm the dishes and their quantities. Please check your cart before sending — from there the waiter takes over.',
    uz: '«Buyurtma berish» tugmasini bosib, taomlar tarkibi va sonini tasdiqlaysiz. Yuborishdan oldin savatni tekshiring — keyin buyurtmani ofitsiant qabul qiladi.',
  },
  'consent.p2.title': {
    ru: 'Отмена — через администратора зала',
    en: 'Cancelling goes through the floor manager',
    uz: 'Bekor qilish — zal administratori orqali',
  },
  'consent.p2.text': {
    ru: 'После подтверждения заказа изменить или отменить его через телефон уже нельзя: блюдо может быть в работе. Подойдите к администратору или позовите официанта — вам помогут.',
    en: 'Once the order is confirmed it can no longer be changed or cancelled from your phone: the dish may already be cooking. Speak to the floor manager or call a waiter — they will help.',
    uz: 'Buyurtma tasdiqlangach, uni telefon orqali o‘zgartirib yoki bekor qilib bo‘lmaydi: taom tayyorlanayotgan bo‘lishi mumkin. Administratorga murojaat qiling yoki ofitsiantni chaqiring — sizga yordam berishadi.',
  },
  'consent.p3.title': {
    ru: 'Аллергии и пожелания — в комментарии',
    en: 'Allergies and requests go in the note',
    uz: 'Allergiya va istaklar — izohda',
  },
  'consent.p3.text': {
    ru: 'Если есть непереносимость продуктов или особые пожелания по подаче, напишите об этом в поле «Комментарий к заказу». Кухня увидит его вместе с заказом.',
    en: 'If you have a food intolerance or a serving request, write it in the “Order note” field. The kitchen sees it together with the order.',
    uz: 'Mahsulotlarga nisbatan chidamsizlik yoki taqdim etish bo‘yicha istaklaringiz bo‘lsa, «Buyurtmaga izoh» maydoniga yozing. Oshxona uni buyurtma bilan birga ko‘radi.',
  },
  'consent.p4.title': {
    ru: 'Геопозиция — только для проверки',
    en: 'Location is used only for the check',
    uz: 'Joylashuv — faqat tekshiruv uchun',
  },
  'consent.p4.text': {
    ru: 'Меню работает в зале ресторана, поэтому браузер спросит разрешение на геопозицию. Координаты используются один раз — чтобы убедиться, что вы за столиком, — и не сохраняются в вашем профиле.',
    en: 'The menu works inside the dining room, so your browser will ask for location access. The coordinates are used once — to confirm you are at a table — and are not stored in your profile.',
    uz: 'Menyu restoran zalida ishlaydi, shuning uchun brauzer joylashuvga ruxsat so‘raydi. Koordinatalar bir marta — stolda ekanligingizni tasdiqlash uchun — ishlatiladi va profilingizda saqlanmaydi.',
  },
  'consent.check': {
    ru: 'Я прочитал(а) и принимаю эти условия',
    en: 'I have read and accept these terms',
    uz: 'Men o‘qidim va ushbu shartlarni qabul qilaman',
  },
  'consent.accept': {
    ru: 'Принять и открыть меню',
    en: 'Accept and open the menu',
    uz: 'Qabul qilish va menyuni ochish',
  },
  'consent.foot': {
    ru: 'Остались вопросы — официант рядом и с радостью на них ответит.',
    en: 'Any questions — your waiter is nearby and will gladly answer them.',
    uz: 'Savollaringiz bo‘lsa — ofitsiant yaqin atrofda va mamnuniyat bilan javob beradi.',
  },

  'demo.notice': {
    ru: 'Это витрина меню. Заказ принимается только в зале ресторана — с планшета или телефона за столиком.',
    en: 'This is a menu showcase. Orders are taken only in the dining room — from a device at your table.',
    uz: 'Bu — menyu vitrinasi. Buyurtma faqat restoran zalida, stoldagi qurilmadan qabul qilinadi.',
  },

  'sent.title': { ru: 'Заказ отправлен', en: 'Order sent', uz: 'Buyurtma yuborildi' },
  'sent.text': {
    ru: 'Официант уже видит его у себя на экране. Как только заказ подтвердят, вы увидите это здесь.',
    en: 'The waiter can already see it on their screen. You will see the confirmation here.',
    uz: 'Ofitsiant uni allaqachon ekranida ko‘rmoqda. Tasdiqlangach, buni shu yerda ko‘rasiz.',
  },
  'accepted.title': { ru: 'Заказ принят', en: 'Order accepted', uz: 'Buyurtma qabul qilindi' },
  'accepted.text': {
    ru: 'Официант подтвердил ваш заказ — кухня уже начала работу.',
    en: 'The waiter has confirmed your order — the kitchen has started.',
    uz: 'Ofitsiant buyurtmangizni tasdiqladi — oshxona ishni boshladi.',
  },
  'accepted.close': { ru: 'Хорошо', en: 'Got it', uz: 'Yaxshi' },

  'err.geo_required': { ru: 'Заказ можно оформить только в ресторане', en: 'Ordering is only possible inside the restaurant', uz: 'Buyurtma faqat restoranda beriladi' },
  'err.geo_out_of_range': { ru: 'Вы вне зоны ресторана', en: 'You are outside the restaurant zone', uz: 'Siz restoran hududidan tashqaridasiz' },
  'err.table_required': { ru: 'Выберите номер столика', en: 'Select your table number', uz: 'Stol raqamini tanlang' },
  'err.empty_cart': { ru: 'Корзина пуста', en: 'Cart is empty', uz: 'Savat bo‘sh' },
  'err.ordering_disabled': { ru: 'Приём заказов временно приостановлен', en: 'Ordering is paused right now', uz: 'Buyurtma qabuli vaqtincha to‘xtatilgan' },
  'err.network': { ru: 'Нет связи с сервером', en: 'Cannot reach the server', uz: 'Server bilan aloqa yo‘q' },
  'err.generic': { ru: 'Что-то пошло не так', en: 'Something went wrong', uz: 'Nimadir noto‘g‘ri ketdi' },

  'sound.on': { ru: 'Звук включён', en: 'Sound on', uz: 'Ovoz yoqilgan' },
  'sound.off': { ru: 'Звук выключен', en: 'Sound off', uz: "Ovoz o‘chirilgan" },

  'common.loading': { ru: 'Загрузка…', en: 'Loading…', uz: 'Yuklanmoqda…' },
  'common.currency': { ru: 'сум', en: 'UZS', uz: 'so‘m' },
  'common.from': { ru: 'от', en: 'from', uz: 'dan' },
  'common.qty': { ru: 'шт', en: 'pcs', uz: 'dona' },
  'common.gram': { ru: 'г', en: 'g', uz: 'g' },
};

export function translate(lang, key) {
  const entry = dict[key];
  if (!entry) return key;
  return entry[lang] || entry[DEFAULT_LANG] || key;
}

/** Picks the right language out of a {ru,en,uz} content field. */
export function pick(value, lang) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value[DEFAULT_LANG] || value.en || '';
}

export function formatPrice(value, lang, currency) {
  const n = Number(value) || 0;
  const formatted = n.toLocaleString(lang === 'en' ? 'en-US' : 'ru-RU').replace(/,/g, ' ');
  return `${formatted} ${currency || translate(lang, 'common.currency')}`;
}
