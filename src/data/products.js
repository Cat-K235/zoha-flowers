export const CATEGORIES = [
  { id: 'all',          emoji: '🌸', nameKey: 'cat.all',          name: "Barchasi" },
  { id: 'bouquets',     emoji: '💐', nameKey: 'cat.bouquets',     name: "Bouquetlar" },
  { id: 'baskets',      emoji: '🧺', nameKey: 'cat.baskets',      name: "Savatchalar" },
  { id: 'arrangements', emoji: '🌺', nameKey: 'cat.arrangements', name: "Kompozitsiyalar" },
  { id: 'gifts',        emoji: '🎁', nameKey: 'cat.gifts',        name: "Sovg'alar" },
  { id: 'wedding',      emoji: '👰', nameKey: 'cat.wedding',      name: "To'y gullari" },
  { id: 'corporate',    emoji: '🏢', nameKey: 'cat.corporate',    name: "Korporativ" },
]

export const PRODUCTS = [
  {
    id: 1,
    name: { uz: "Atirgul Klassik", ru: "Классика Роз", en: "Classic Roses" },
    desc: { uz: "25 ta qizil atirgul, havorang lentali. Sevgi va mehr ifodasi uchun ideal tanlov.", ru: "25 красных роз с голубой лентой. Идеальный выбор для выражения любви и нежности.", en: "25 red roses with blue ribbon. The perfect expression of love and tenderness." },
    price: 250000, oldPrice: null, category: 'bouquets', emoji: '🌹',
    badge: null, rating: 4.9, reviews: 128,
    composition: ["Qizil atirgul ×25", "Gipsofila", "Yashil barglar", "Premium o'rash"],
    featured: true, bestseller: true, newArrival: false, seasonal: false,
  },
  {
    id: 2,
    name: { uz: "Pion Bouquet", ru: "Букет Пионов", en: "Peony Bouquet" },
    desc: { uz: "Nozik pushti pion gullari bilan yaratilgan nafis bouquet.", ru: "Нежный букет из розовых пионов.", en: "A delicate bouquet of pink peonies." },
    price: 320000, oldPrice: 380000, category: 'bouquets', emoji: '🌸',
    badge: 'sale', rating: 4.8, reviews: 95,
    composition: ["Pion ×15", "Evkalip", "Beybi dyt", "Craft o'rash"],
    featured: true, bestseller: false, newArrival: true, seasonal: true,
  },
  {
    id: 3,
    name: { uz: "Lavanda Savat", ru: "Лавандовая Корзина", en: "Lavender Basket" },
    desc: { uz: "So'latma savatda yig'ilgan qovoqrang lavanda va oq lizianton.", ru: "Нежная лаванда и белая лизиантус в плетёной корзине.", en: "Purple lavender and white lisianthus in a woven basket." },
    price: 195000, oldPrice: null, category: 'baskets', emoji: '🪻',
    badge: 'new', rating: 4.7, reviews: 42,
    composition: ["Lavanda ×20", "Lizianton ×5", "Ruskus", "Qo'l to'qilgan savatcha"],
    featured: false, bestseller: true, newArrival: true, seasonal: false,
  },
  {
    id: 4,
    name: { uz: "Gerbera Aralashmasi", ru: "Микс из Гербер", en: "Gerbera Mix" },
    desc: { uz: "Rang-barang gerberalar — quvonch va quyosh kayfiyati uchun ajoyib sovg'a.", ru: "Разноцветные герберы — отличный подарок для создания радостного настроения.", en: "Colorful gerberas — a wonderful gift to spread joy and sunshine." },
    price: 165000, oldPrice: null, category: 'bouquets', emoji: '🌼',
    badge: null, rating: 4.6, reviews: 73,
    composition: ["Gerbera ×21", "Gypsophila", "Lenta bezak"],
    featured: true, bestseller: true, newArrival: false, seasonal: false,
  },
  {
    id: 5,
    name: { uz: "To'y Aranjimani", ru: "Свадебная Композиция", en: "Wedding Arrangement" },
    desc: { uz: "Oq atirgul va yashil evkalip bilan bezatilgan premium to'y aranjimani.", ru: "Премиальная свадебная композиция из белых роз и эвкалипта.", en: "Premium wedding arrangement with white roses and eucalyptus." },
    price: 850000, oldPrice: null, category: 'wedding', emoji: '💍',
    badge: null, rating: 5.0, reviews: 31,
    composition: ["Oq atirgul ×50", "Evkalip ×10", "Oq lizianton ×10", "Kovyl", "Premium tagtaxta"],
    featured: true, bestseller: false, newArrival: false, seasonal: false,
  },
  {
    id: 6,
    name: { uz: "Bahor Guldoni", ru: "Весенняя Ваза", en: "Spring Vase" },
    desc: { uz: "Shisha vazan ichida turli xil bahor gullari aralashmasi.", ru: "Смешанные весенние цветы в стеклянной вазе.", en: "Mixed spring flowers in a glass vase arrangement." },
    price: 280000, oldPrice: 320000, category: 'arrangements', emoji: '🌷',
    badge: 'sale', rating: 4.8, reviews: 56,
    composition: ["Laleh ×10", "Nartsis ×8", "Muscari ×15", "Shisha vazan"],
    featured: false, bestseller: false, newArrival: true, seasonal: true,
  },
  {
    id: 7,
    name: { uz: "Korporativ Set", ru: "Корпоративный Сет", en: "Corporate Set" },
    desc: { uz: "Ofis yoki korporativ tadbirlar uchun maxsus yaratilgan premium gul kompozitsiyasi.", ru: "Специальная цветочная композиция для офиса или корпоративных мероприятий.", en: "Premium floral arrangement designed for offices or corporate events." },
    price: 650000, oldPrice: null, category: 'corporate', emoji: '🌿',
    badge: null, rating: 4.9, reviews: 18,
    composition: ["Oq krizantem ×20", "Yashil atirgul ×10", "Ruskus", "Korporativ lenta"],
    featured: false, bestseller: false, newArrival: false, seasonal: false,
  },
  {
    id: 8,
    name: { uz: "Sovg'a To'plami", ru: "Подарочный Набор", en: "Gift Set" },
    desc: { uz: "Gul bouqueti, shokolad va xushbo'y shamlardan iborat mukammal sovg'a to'plami.", ru: "Идеальный подарочный набор: букет, шоколад и ароматные свечи.", en: "The perfect gift set: bouquet, chocolates, and aromatic candles." },
    price: 450000, oldPrice: 520000, category: 'gifts', emoji: '🎁',
    badge: 'sale', rating: 4.9, reviews: 84,
    composition: ["Mini bouquet ×1", "Belgiyacha shokolad", "Xushbo'y sham ×2", "Premium quti"],
    featured: true, bestseller: true, newArrival: false, seasonal: false,
  },
  {
    id: 9,
    name: { uz: "Qizg'aldoq Dalasi", ru: "Полевые Маки", en: "Wild Poppies" },
    desc: { uz: "Qizil qizg'aldoq va sariq gullardan tashkil topgan tabiiy dala bouqueti.", ru: "Натуральный полевой букет из красных маков и желтых цветов.", en: "Natural wildflower bouquet with red poppies and yellow blooms." },
    price: 145000, oldPrice: null, category: 'bouquets', emoji: '🏵️',
    badge: 'new', rating: 4.5, reviews: 29,
    composition: ["Qizg'aldoq ×15", "Rayhon", "Sariq ziniya ×8", "Kraft o'rash"],
    featured: false, bestseller: false, newArrival: true, seasonal: true,
  },
  {
    id: 10,
    name: { uz: "Oq Pion Savati", ru: "Корзина Белых Пионов", en: "White Peony Basket" },
    desc: { uz: "Oq pion gullari bilan to'ldirilgan romantik savatcha.", ru: "Романтическая корзина с белыми пионами.", en: "Romantic basket filled with white peonies." },
    price: 380000, oldPrice: null, category: 'baskets', emoji: '🤍',
    badge: null, rating: 4.9, reviews: 47,
    composition: ["Oq pion ×20", "Gypsophila", "Yashil ruskus", "Vintaj savatcha"],
    featured: true, bestseller: true, newArrival: false, seasonal: true,
  },
  {
    id: 11,
    name: { uz: "Sariq Quyosh", ru: "Жёлтое Солнце", en: "Yellow Sunshine" },
    desc: { uz: "21 ta sariq atirgul — quvonch, do'stlik va mehr belgisi.", ru: "21 жёлтая роза — символ радости, дружбы и тепла.", en: "21 yellow roses — the symbol of joy, friendship, and warmth." },
    price: 220000, oldPrice: 260000, category: 'bouquets', emoji: '🌻',
    badge: 'sale', rating: 4.7, reviews: 61,
    composition: ["Sariq atirgul ×21", "Mimoza ×5", "Yashil barglar", "Sariq lenta"],
    featured: false, bestseller: true, newArrival: false, seasonal: false,
  },
  {
    id: 12,
    name: { uz: "Orzular Bouquet", ru: "Букет Мечты", en: "Dream Bouquet" },
    desc: { uz: "Pushti va lilak atirgullar, pion va magnoliyalardan tashkil topgan orzularingiz bouqueti.", ru: "Букет мечты из розовых и лиловых роз, пионов и магнолий.", en: "Dream bouquet of pink and lilac roses, peonies, and magnolias." },
    price: 520000, oldPrice: null, category: 'bouquets', emoji: '💜',
    badge: null, rating: 5.0, reviews: 19,
    composition: ["Pushti atirgul ×15", "Lilak atirgul ×10", "Pion ×5", "Magnoliya ×3", "Premium o'rash"],
    featured: true, bestseller: false, newArrival: true, seasonal: false,
  },
]

export const REVIEWS = [
  { id: 1, name: "Nilufar K.", avatar: "👩", rating: 5, text: { uz: "Juda chiroyli bouquet! Vaqtida yetkazib berishdi.", ru: "Очень красивый букет! Доставили вовремя.", en: "Very beautiful bouquet! Delivered on time." }, date: "2024-03-15" },
  { id: 2, name: "Jasur A.", avatar: "👨", rating: 5, text: { uz: "Xotinim uchun buyurtma berdim - juda xursand bo'ldi.", ru: "Заказал для жены — она была в восторге.", en: "Ordered for my wife — she was delighted." }, date: "2024-03-10" },
  { id: 3, name: "Malika T.", avatar: "👩‍🦱", rating: 4, text: { uz: "Chiroyli va narxi ham yaxshi. Yetkazib berish tez edi.", ru: "Красиво и цена хорошая. Доставка была быстрой.", en: "Beautiful and good price. Delivery was fast." }, date: "2024-03-08" },
  { id: 4, name: "Bobur N.", avatar: "👨‍💼", rating: 5, text: { uz: "Korporativ buyurtma uchun uyushqoq xizmat.", ru: "Организованный сервис для корпоративного заказа.", en: "Organized service for corporate order." }, date: "2024-03-05" },
  { id: 5, name: "Shirin M.", avatar: "👧", rating: 5, text: { uz: "Onasiga yuborgandim - juda xursand bo'ldi!", ru: "Отправила маме — она была очень рада!", en: "Sent to mom — she was so happy!" }, date: "2024-02-28" },
]

export const BUILDER_FLOWERS = [
  { id: 'rose',      emoji: '🌹', name: { uz: "Atirgul",   ru: "Роза",      en: "Rose"      }, price: 12000 },
  { id: 'tulip',     emoji: '🌷', name: { uz: "Laleh",     ru: "Тюльпан",   en: "Tulip"     }, price: 8000  },
  { id: 'sunflower', emoji: '🌻', name: { uz: "Quyoshgul", ru: "Подсолнух", en: "Sunflower" }, price: 10000 },
  { id: 'daisy',     emoji: '🌼', name: { uz: "Margarit",  ru: "Ромашка",   en: "Daisy"     }, price: 6000  },
  { id: 'orchid',    emoji: '🌺', name: { uz: "Orkide",    ru: "Орхидея",   en: "Orchid"    }, price: 18000 },
  { id: 'lily',      emoji: '💐', name: { uz: "Nilufar",   ru: "Лилия",     en: "Lily"      }, price: 14000 },
  { id: 'peony',     emoji: '🌸', name: { uz: "Pion",      ru: "Пион",      en: "Peony"     }, price: 16000 },
  { id: 'lavender',  emoji: '🪻', name: { uz: "Lavanda",   ru: "Лаванда",   en: "Lavender"  }, price: 9000  },
]

export const ADMIN_USER_IDS = [8748057822, 7498042030]

export const getProductById = (id) => PRODUCTS.find(p => p.id === Number(id))
export const getProductsByCategory = (cat) => cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === cat)
export const getFeatured = () => PRODUCTS.filter(p => p.featured)
export const getBestSellers = () => PRODUCTS.filter(p => p.bestseller)
export const getNewArrivals = () => PRODUCTS.filter(p => p.newArrival)
export const getSeasonal = () => PRODUCTS.filter(p => p.seasonal)
export const searchProducts = (query) => {
  const q = query.toLowerCase()
  return PRODUCTS.filter(p =>
    Object.values(p.name).some(n => n.toLowerCase().includes(q)) ||
    Object.values(p.desc).some(d => d.toLowerCase().includes(q)) ||
    p.composition.some(c => c.toLowerCase().includes(q))
  )
}
