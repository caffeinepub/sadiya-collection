/**
 * AI Title Generator
 * Generates SEO-optimized product titles based on category and Google trending keywords.
 */

interface TitleTemplate {
  templates: string[];
  keywords: string[];
}

const CATEGORY_TITLE_MAP: Record<string, TitleTemplate> = {
  // Bags
  Handbags: {
    templates: [
      "Premium {adj} Handbag for Women | {kw1} Designer Bag {year}",
      "Luxury {adj} Women's Handbag | {kw1} & Stylish Carry",
      "{adj} Designer Handbag | {kw1} Trending Women's Bag {year}",
    ],
    keywords: ["leather", "designer", "premium", "stylish", "elegant"],
  },
  Backpacks: {
    templates: [
      "{adj} Backpack for {use} | {kw1} Travel Bag {year}",
      "Premium {adj} Laptop Backpack | {kw1} Daily Use Bag",
      "{adj} Anti-Theft Backpack | {kw1} College & Office Bag {year}",
    ],
    keywords: ["waterproof", "laptop", "anti-theft", "durable", "lightweight"],
  },
  "Tote Bags": {
    templates: [
      "{adj} Tote Bag for Women | {kw1} Everyday Carry {year}",
      "Spacious {adj} Tote | {kw1} Office & Shopping Bag",
      "Premium {adj} Canvas Tote Bag | {kw1} Eco-Friendly Carry",
    ],
    keywords: ["canvas", "leather", "large", "reusable", "multipurpose"],
  },
  "Travel Bags": {
    templates: [
      "{adj} Travel Duffel Bag | {kw1} Weekend Getaway Bag {year}",
      "Premium {adj} Travel Bag | {kw1} Carry-On Approved",
      "{adj} Waterproof Travel Bag | {kw1} Adventure Luggage {year}",
    ],
    keywords: ["waterproof", "durable", "carry-on", "spacious", "lightweight"],
  },
  Clutches: {
    templates: [
      "Elegant {adj} Clutch Purse | {kw1} Party & Evening Bag {year}",
      "{adj} Embellished Clutch | {kw1} Festive & Wedding Carry",
      "Designer {adj} Clutch Bag | {kw1} Party Accessory {year}",
    ],
    keywords: ["sequin", "embellished", "velvet", "metallic", "glitter"],
  },
  "Shoulder Bags": {
    templates: [
      "{adj} Shoulder Bag for Women | {kw1} Daily Use Purse {year}",
      "Trendy {adj} Shoulder Handbag | {kw1} Casual & Office Bag",
      "Premium {adj} Shoulder Bag | {kw1} Multi-Compartment Carry",
    ],
    keywords: ["leather", "suede", "structured", "adjustable", "premium"],
  },
  "Crossbody Bags": {
    templates: [
      "{adj} Crossbody Sling Bag | {kw1} Hands-Free Carry {year}",
      "Compact {adj} Crossbody Bag | {kw1} Travel & Daily Use",
      "{adj} Mini Crossbody Purse | {kw1} Trendy Women's Bag {year}",
    ],
    keywords: ["compact", "adjustable", "mini", "trendy", "lightweight"],
  },
  Wallets: {
    templates: [
      "Slim {adj} Leather Wallet | {kw1} RFID Blocking Card Holder {year}",
      "Premium {adj} Bifold Wallet | {kw1} Men's & Women's Carry",
      "{adj} Designer Wallet | {kw1} Slim & Stylish Money Holder",
    ],
    keywords: ["slim", "RFID", "bifold", "leather", "minimalist"],
  },
  "Duffle Bags": {
    templates: [
      "{adj} Gym Duffle Bag | {kw1} Sports & Travel Bag {year}",
      "Large {adj} Duffle | {kw1} Gym, Travel & Weekend Bag",
      "Premium {adj} Duffle Bag | {kw1} Sports & Fitness Carry {year}",
    ],
    keywords: ["gym", "sports", "waterproof", "large", "durable"],
  },
  "Kids Bags": {
    templates: [
      "Cute {adj} Kids School Bag | {kw1} Ergonomic Backpack {year}",
      "{adj} Children's Bag | {kw1} Lightweight & Fun School Carry",
      "Colorful {adj} Kids Bag | {kw1} School & Playdate Pack",
    ],
    keywords: ["ergonomic", "lightweight", "colorful", "waterproof", "cute"],
  },
  // Clothing
  "Men's Clothing": {
    templates: [
      "Stylish {adj} Men's {item} | {kw1} Trending Menswear {year}",
      "Premium {adj} Men's Outfit | {kw1} Casual & Formal Wear",
      "{adj} Men's Fashion {item} | {kw1} Latest Collection {year}",
    ],
    keywords: ["cotton", "slim-fit", "casual", "formal", "premium"],
  },
  "Women's Clothing": {
    templates: [
      "Trendy {adj} Women's {item} | {kw1} Latest Fashion {year}",
      "Elegant {adj} Women's Wear | {kw1} Stylish Outfit Collection",
      "{adj} Women's Fashion {item} | {kw1} Comfortable & Chic {year}",
    ],
    keywords: ["floral", "elegant", "casual", "comfortable", "stylish"],
  },
  "Kids Clothing": {
    templates: [
      "Cute {adj} Kids {item} | {kw1} Comfortable Children's Wear {year}",
      "{adj} Kids Outfit | {kw1} Soft & Durable Children's Clothing",
      "Adorable {adj} Kids Wear | {kw1} School & Play Outfit {year}",
    ],
    keywords: ["soft", "comfortable", "durable", "cute", "cotton"],
  },
  "Traditional Wear": {
    templates: [
      "Stunning {adj} Ethnic Wear | {kw1} Festive & Wedding Outfit {year}",
      "Beautiful {adj} Traditional {item} | {kw1} Handcrafted Design",
      "Elegant {adj} Ethnic Outfit | {kw1} Kurta Set & Traditional Wear {year}",
    ],
    keywords: [
      "handcrafted",
      "ethnic",
      "festive",
      "embroidered",
      "traditional",
    ],
  },
  Sportswear: {
    templates: [
      "Performance {adj} Activewear | {kw1} Sports & Gym Outfit {year}",
      "{adj} Athletic Wear | {kw1} Moisture-Wicking Sports Clothing",
      "High-Performance {adj} Sportswear | {kw1} Workout Outfit {year}",
    ],
    keywords: ["moisture-wicking", "breathable", "flex", "performance", "gym"],
  },
  // Footwear
  "Men's Shoes": {
    templates: [
      "Premium {adj} Men's Shoes | {kw1} Formal & Casual Footwear {year}",
      "Stylish {adj} Men's Footwear | {kw1} Leather Oxford & Loafers",
      "{adj} Men's Leather Shoes | {kw1} Trending Footwear {year}",
    ],
    keywords: ["leather", "formal", "casual", "oxford", "comfortable"],
  },
  "Women's Shoes": {
    templates: [
      "Elegant {adj} Women's Shoes | {kw1} Heels & Flats {year}",
      "Trendy {adj} Women's Footwear | {kw1} Block Heels & Stilettos",
      "{adj} Women's Block Heels | {kw1} Comfortable Fashion Shoes {year}",
    ],
    keywords: ["block-heel", "stiletto", "flats", "comfortable", "elegant"],
  },
  Sandals: {
    templates: [
      "Comfortable {adj} Sandals | {kw1} Summer Footwear {year}",
      "{adj} Kolhapuri Sandals | {kw1} Traditional & Casual Chappals",
      "Stylish {adj} Flats & Sandals | {kw1} Everyday Footwear {year}",
    ],
    keywords: ["comfortable", "casual", "summer", "kolhapuri", "flat"],
  },
  "Sports Shoes": {
    templates: [
      "High-Performance {adj} Running Shoes | {kw1} Sports & Gym Footwear {year}",
      "{adj} Athletic Sneakers | {kw1} Cushioned Running Shoes",
      "Lightweight {adj} Sports Shoes | {kw1} Marathon & Gym Wear {year}",
    ],
    keywords: ["cushioned", "lightweight", "breathable", "running", "gym"],
  },
  "Kids Footwear": {
    templates: [
      "Comfortable {adj} Kids Shoes | {kw1} School & Play Footwear {year}",
      "{adj} Children's Sneakers | {kw1} Durable Kids Footwear",
      "Cute {adj} Kids Sandals | {kw1} Fun & Comfortable Children's Shoes {year}",
    ],
    keywords: ["comfortable", "durable", "lightweight", "cute", "school"],
  },
  // Accessories
  Sunglasses: {
    templates: [
      "UV400 {adj} Sunglasses | {kw1} Polarized Eyewear {year}",
      "Trendy {adj} Designer Sunglasses | {kw1} Men's & Women's Shades",
      "{adj} Oversized Sunglasses | {kw1} Trending UV Protection Eyewear {year}",
    ],
    keywords: ["UV400", "polarized", "designer", "oversized", "trending"],
  },
  Belts: {
    templates: [
      "Premium {adj} Leather Belt | {kw1} Formal & Casual Waist Strap {year}",
      "Genuine {adj} Leather Belt | {kw1} Men's & Women's Fashion",
      "{adj} Designer Belt | {kw1} Buckle & Casual Leather Strap {year}",
    ],
    keywords: ["genuine leather", "formal", "buckle", "premium", "reversible"],
  },
  Scarves: {
    templates: [
      "Soft {adj} Silk Scarf | {kw1} Neck & Head Wrap {year}",
      "{adj} Printed Stole & Dupatta | {kw1} Women's Ethnic Scarf",
      "Premium {adj} Cashmere Scarf | {kw1} Winter & Fashion Wrap {year}",
    ],
    keywords: ["silk", "cashmere", "printed", "ethnic", "soft"],
  },
  "Caps & Hats": {
    templates: [
      "Trendy {adj} Baseball Cap | {kw1} Unisex Street Fashion {year}",
      "Stylish {adj} Hat & Cap | {kw1} Sun Protection Headwear",
      "{adj} Designer Cap | {kw1} Sports & Casual Headwear {year}",
    ],
    keywords: ["unisex", "adjustable", "embroidered", "casual", "sporty"],
  },
  Ties: {
    templates: [
      "Premium {adj} Silk Tie | {kw1} Men's Formal Necktie {year}",
      "{adj} Designer Necktie | {kw1} Office & Wedding Tie",
      "Woven {adj} Tie & Bow Tie Set | {kw1} Men's Formal Accessory {year}",
    ],
    keywords: ["silk", "woven", "formal", "wedding", "office"],
  },
  // Jewelry
  Necklaces: {
    templates: [
      "Elegant {adj} Necklace | {kw1} Women's Fashion Jewelry {year}",
      "{adj} Gold-Plated Necklace Set | {kw1} Festive & Bridal Jewelry",
      "Sparkling {adj} Pendant Necklace | {kw1} Everyday & Party Wear {year}",
    ],
    keywords: ["gold-plated", "pendant", "layered", "elegant", "festive"],
  },
  Earrings: {
    templates: [
      "Trendy {adj} Earrings | {kw1} Women's Stud & Drop Jewelry {year}",
      "{adj} Jhumka Earrings | {kw1} Ethnic & Party Wear",
      "Sparkling {adj} Diamond Earrings | {kw1} Statement Jewelry {year}",
    ],
    keywords: ["jhumka", "stud", "drop", "ethnic", "statement"],
  },
  Bracelets: {
    templates: [
      "Stylish {adj} Bracelet | {kw1} Women's Charm & Chain Jewelry {year}",
      "{adj} Gold-Plated Bracelet | {kw1} Fashion & Daily Wear",
      "Handcrafted {adj} Bracelet | {kw1} Boho & Ethnic Wristband {year}",
    ],
    keywords: ["charm", "gold-plated", "handcrafted", "boho", "elegant"],
  },
  Rings: {
    templates: [
      "Elegant {adj} Ring | {kw1} Women's Fashion Jewelry {year}",
      "{adj} Diamond-Studded Ring | {kw1} Engagement & Party Ring",
      "Gold-Plated {adj} Statement Ring | {kw1} Finger Jewelry {year}",
    ],
    keywords: [
      "diamond",
      "gold-plated",
      "statement",
      "engagement",
      "adjustable",
    ],
  },
  Bangles: {
    templates: [
      "Traditional {adj} Bangles Set | {kw1} Ethnic & Festive Jewelry {year}",
      "{adj} Gold Bangles | {kw1} Meenakari & Bridal Wear",
      "Stylish {adj} Bangle Set | {kw1} Women's Fashion Jewelry {year}",
    ],
    keywords: ["meenakari", "ethnic", "bridal", "gold", "traditional"],
  },
  // Home & Lifestyle
  "Home Decor": {
    templates: [
      "Aesthetic {adj} Home Decor | {kw1} Interior Design Item {year}",
      "{adj} Decorative Item | {kw1} Modern Home Accent Piece",
      "Handcrafted {adj} Home Decor | {kw1} Living Room & Bedroom Decor {year}",
    ],
    keywords: ["aesthetic", "modern", "handcrafted", "minimalist", "elegant"],
  },
  Bedding: {
    templates: [
      "Luxurious {adj} Bedding Set | {kw1} Soft Cotton Bed Sheet {year}",
      "{adj} King/Queen Size Bedsheet | {kw1} Premium Bedding Collection",
      "Comfortable {adj} Duvet & Pillow Cover | {kw1} Home Textile {year}",
    ],
    keywords: ["cotton", "premium", "soft", "king-size", "comfortable"],
  },
  "Kitchen Items": {
    templates: [
      "Premium {adj} Kitchen Utensil | {kw1} Cooking Essentials {year}",
      "{adj} Stainless Steel Kitchenware | {kw1} Chef's Kitchen Must-Have",
      "Durable {adj} Kitchen Tool | {kw1} Home Cooking Accessory {year}",
    ],
    keywords: ["stainless steel", "durable", "non-stick", "chef", "premium"],
  },
  "Candles & Fragrance": {
    templates: [
      "Aromatic {adj} Soy Candle | {kw1} Home Fragrance & Decor {year}",
      "{adj} Scented Candle Set | {kw1} Relaxing & Gift-Ready",
      "Luxury {adj} Fragrance Candle | {kw1} Aroma Therapy & Room Decor {year}",
    ],
    keywords: ["soy", "aromatic", "scented", "luxury", "gift"],
  },
  // Electronics
  "Mobile Accessories": {
    templates: [
      "Protective {adj} Phone Case | {kw1} Mobile Cover {year}",
      "{adj} Wireless Charger & Power Bank | {kw1} Mobile Accessories",
      "Premium {adj} Phone Accessories | {kw1} Case, Stand & Charger {year}",
    ],
    keywords: [
      "wireless",
      "protective",
      "compatible",
      "premium",
      "fast-charging",
    ],
  },
  Earphones: {
    templates: [
      "High-Quality {adj} Earphones | {kw1} TWS Wireless Earbuds {year}",
      "{adj} Noise-Cancelling Headphones | {kw1} Premium Audio",
      "Premium {adj} In-Ear Headphones | {kw1} Bass & Clarity Music {year}",
    ],
    keywords: ["noise-cancelling", "TWS", "wireless", "bass", "premium"],
  },
  Smartwatches: {
    templates: [
      "Feature-Packed {adj} Smartwatch | {kw1} Fitness & Health Tracker {year}",
      "{adj} Smart Band & Watch | {kw1} Bluetooth Fitness Wearable",
      "Premium {adj} Smartwatch | {kw1} Health Monitoring & Notifications {year}",
    ],
    keywords: [
      "fitness tracker",
      "Bluetooth",
      "health monitoring",
      "waterproof",
      "smart",
    ],
  },
  // Beauty & Personal Care
  Skincare: {
    templates: [
      "Hydrating {adj} Skincare Set | {kw1} Glowing Skin Solution {year}",
      "{adj} Natural Face Serum & Cream | {kw1} Skincare Routine",
      "Dermatologist-Approved {adj} Skincare | {kw1} Anti-Aging & Brightening {year}",
    ],
    keywords: [
      "hydrating",
      "natural",
      "brightening",
      "anti-aging",
      "dermatologist",
    ],
  },
  Makeup: {
    templates: [
      "Long-Lasting {adj} Makeup Kit | {kw1} Beauty Essentials {year}",
      "{adj} Foundation & Lipstick Set | {kw1} Everyday Makeup Collection",
      "Premium {adj} Cosmetics Set | {kw1} Trending Makeup {year}",
    ],
    keywords: ["long-lasting", "waterproof", "pigmented", "natural", "premium"],
  },
  Haircare: {
    templates: [
      "Nourishing {adj} Hair Care Kit | {kw1} Shampoo & Conditioner Set {year}",
      "{adj} Hair Growth & Repair Serum | {kw1} Damage-Free Hair Care",
      "Premium {adj} Haircare Products | {kw1} Anti-Hair Fall Solution {year}",
    ],
    keywords: ["nourishing", "anti-hairfall", "growth", "keratin", "natural"],
  },
  Perfumes: {
    templates: [
      "Long-Lasting {adj} Perfume | {kw1} Luxury Fragrance {year}",
      "{adj} Eau de Parfum | {kw1} Floral & Woody Scent Collection",
      "Premium {adj} Unisex Fragrance | {kw1} Trending Perfume {year}",
    ],
    keywords: ["long-lasting", "floral", "woody", "luxury", "unisex"],
  },
  // Sports & Fitness
  "Gym Equipment": {
    templates: [
      "Heavy-Duty {adj} Gym Equipment | {kw1} Home Workout Gear {year}",
      "{adj} Resistance Bands & Weights | {kw1} Fitness Training Set",
      "Premium {adj} Home Gym Kit | {kw1} Strength & Cardio Equipment {year}",
    ],
    keywords: ["resistance", "heavy-duty", "home-gym", "strength", "cardio"],
  },
  Yoga: {
    templates: [
      "Non-Slip {adj} Yoga Mat | {kw1} Eco-Friendly Fitness Mat {year}",
      "{adj} Yoga Accessories Set | {kw1} Block, Strap & Mat Bundle",
      "Premium {adj} Yoga Kit | {kw1} Meditation & Flexibility Training {year}",
    ],
    keywords: ["non-slip", "eco-friendly", "thick", "meditation", "premium"],
  },
  "Outdoor Sports": {
    templates: [
      "Durable {adj} Outdoor Sports Gear | {kw1} Adventure Accessories {year}",
      "{adj} Cycling & Hiking Equipment | {kw1} Outdoor Fitness Gear",
      "Rugged {adj} Sports Gear | {kw1} Camping & Trekking Equipment {year}",
    ],
    keywords: ["durable", "rugged", "waterproof", "adventure", "trekking"],
  },
  // Books & Stationery
  Books: {
    templates: [
      "Bestselling {adj} Book | {kw1} Must-Read {year} Collection",
      "{adj} Self-Help & Business Book | {kw1} Top Rated Reads",
      "Educational {adj} Book | {kw1} Knowledge & Skill-Building {year}",
    ],
    keywords: [
      "bestseller",
      "educational",
      "inspiring",
      "must-read",
      "self-help",
    ],
  },
  Notebooks: {
    templates: [
      "Premium {adj} Hardcover Notebook | {kw1} Dot Grid & Lined Journal {year}",
      "{adj} A5 Bullet Journal | {kw1} Stationery & Planner",
      "Aesthetic {adj} Notebook Set | {kw1} Study & Work Journal {year}",
    ],
    keywords: ["hardcover", "dot-grid", "aesthetic", "A5", "planner"],
  },
  "Art Supplies": {
    templates: [
      "Professional {adj} Art Supplies Kit | {kw1} Drawing & Painting Set {year}",
      "{adj} Sketch Pencils & Watercolor | {kw1} Artist's Essential Kit",
      "Premium {adj} Art Materials | {kw1} Creative Drawing & Craft Set {year}",
    ],
    keywords: ["professional", "watercolor", "sketch", "premium", "artist"],
  },
  // Toys & Kids
  Toys: {
    templates: [
      "Fun {adj} Kids Toy | {kw1} Educational & Creative Play {year}",
      "{adj} Learning Toy Set | {kw1} Age-Appropriate Safe Toy",
      "Interactive {adj} Kids Toy | {kw1} STEM & Fun Activity {year}",
    ],
    keywords: ["educational", "safe", "interactive", "fun", "STEM"],
  },
  "Educational Games": {
    templates: [
      "Educational {adj} Board Game | {kw1} Learning & Fun Activity {year}",
      "{adj} STEM Game for Kids | {kw1} Brain Development Toy",
      "Engaging {adj} Educational Game | {kw1} Family Fun & Learning {year}",
    ],
    keywords: ["STEM", "brain-development", "engaging", "family", "learning"],
  },
  "Baby Products": {
    templates: [
      "Safe {adj} Baby Product | {kw1} Soft & BPA-Free Infant Gear {year}",
      "{adj} Newborn Baby Kit | {kw1} Essential Baby Care Products",
      "Premium {adj} Baby Essentials | {kw1} Soft, Safe & Durable {year}",
    ],
    keywords: ["BPA-free", "safe", "soft", "newborn", "essential"],
  },
};

const ADJECTIVES = [
  "Premium",
  "Luxury",
  "Classic",
  "Designer",
  "Elegant",
  "Stylish",
  "Trendy",
  "Handcrafted",
  "Artisan",
];

const ITEM_WORDS: Record<string, string[]> = {
  "Men's Clothing": ["Shirt", "Kurta", "Jacket", "T-Shirt", "Trousers"],
  "Women's Clothing": ["Kurta Set", "Dress", "Top", "Saree", "Blouse"],
  "Kids Clothing": ["Set", "Frock", "Shirt", "Shorts", "Dungaree"],
  "Traditional Wear": [
    "Kurta Set",
    "Saree",
    "Lehenga",
    "Sherwani",
    "Salwar Suit",
  ],
};

const USE_WORDS = ["College", "Office", "Travel", "Daily", "Sports"];

export function generateSmartTitle(
  category: string,
  _currentName?: string,
): string {
  const year = new Date().getFullYear();
  const template = CATEGORY_TITLE_MAP[category] || CATEGORY_TITLE_MAP.Handbags;

  const templateStr =
    template.templates[Math.floor(Math.random() * template.templates.length)];
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const kw1 =
    template.keywords[Math.floor(Math.random() * template.keywords.length)];
  const item =
    ITEM_WORDS[category]?.[
      Math.floor(Math.random() * (ITEM_WORDS[category]?.length ?? 1))
    ] || "Item";
  const use = USE_WORDS[Math.floor(Math.random() * USE_WORDS.length)];

  return templateStr
    .replace("{adj}", adj)
    .replace("{kw1}", kw1)
    .replace("{item}", item)
    .replace("{use}", use)
    .replace("{year}", year.toString());
}
