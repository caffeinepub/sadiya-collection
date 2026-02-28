import type { Product } from "../backend.d";

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "sample-1",
    name: "Classic Leather Tote",
    description:
      "A timeless structured tote in full-grain brown leather. Gold hardware, interior pockets, magnetic clasp closure. Perfect for everyday elegance.",
    category: "Tote Bags",
    price: 349900n,
    stockQuantity: 15n,
    imageUrls: ["/assets/generated/bag-tote.dim_600x600.jpg"],
    isActive: true,
    discountPercent: 10n,
    createdAt: BigInt(Date.now()) * 1000000n,
  },
  {
    id: "sample-2",
    name: "Heritage Structured Handbag",
    description:
      "Expertly crafted in pebbled leather with suede lining. Features a top handle and detachable crossbody strap. Fits all your daily essentials.",
    category: "Handbags",
    price: 499900n,
    stockQuantity: 8n,
    imageUrls: ["/assets/generated/bag-handbag.dim_600x600.jpg"],
    isActive: true,
    discountPercent: 0n,
    createdAt: BigInt(Date.now()) * 1000000n,
  },
  {
    id: "sample-3",
    name: "Wanderlust Travel Duffel",
    description:
      "Weekend-ready black leather duffel with silver hardware, padded handles, and ample internal compartments. Carry-on approved.",
    category: "Travel Bags",
    price: 699900n,
    stockQuantity: 5n,
    imageUrls: ["/assets/generated/bag-travel.dim_600x600.jpg"],
    isActive: true,
    discountPercent: 15n,
    createdAt: BigInt(Date.now()) * 1000000n,
  },
  {
    id: "sample-4",
    name: "Burgundy Urban Backpack",
    description:
      "Chic leather backpack perfect for work or city adventures. Padded laptop compartment, anti-theft back pocket, gold zippers.",
    category: "Backpacks",
    price: 279900n,
    stockQuantity: 12n,
    imageUrls: ["/assets/generated/bag-backpack.dim_600x600.jpg"],
    isActive: true,
    discountPercent: 0n,
    createdAt: BigInt(Date.now()) * 1000000n,
  },
  {
    id: "sample-5",
    name: "Evening Sequin Clutch",
    description:
      "Dazzling gold sequin clutch with a sleek fold-over design. Detachable chain strap. Your go-to for every festive occasion.",
    category: "Clutches",
    price: 149900n,
    stockQuantity: 20n,
    imageUrls: ["/assets/generated/bag-clutch.dim_600x600.jpg"],
    isActive: true,
    discountPercent: 5n,
    createdAt: BigInt(Date.now()) * 1000000n,
  },
  {
    id: "sample-6",
    name: "Nomad Crossbody Sling",
    description:
      "Tan leather crossbody bag with adjustable strap and brass hardware. Compact yet spacious enough for all your daily must-haves.",
    category: "Crossbody Bags",
    price: 199900n,
    stockQuantity: 18n,
    imageUrls: ["/assets/generated/bag-crossbody.dim_600x600.jpg"],
    isActive: true,
    discountPercent: 0n,
    createdAt: BigInt(Date.now()) * 1000000n,
  },
  {
    id: "sample-7",
    name: "Prestige Slim Wallet",
    description:
      "Premium full-grain leather wallet with 8 card slots, bill compartment, and an embossed geometric pattern. Slim yet spacious.",
    category: "Wallets",
    price: 89900n,
    stockQuantity: 30n,
    imageUrls: ["/assets/generated/bag-wallet.dim_600x600.jpg"],
    isActive: true,
    discountPercent: 0n,
    createdAt: BigInt(Date.now()) * 1000000n,
  },
  {
    id: "sample-8",
    name: "Lux Shoulder Bag",
    description:
      "A sleek shoulder bag in soft pebbled leather. Front flap with magnetic snap, adjustable chain-and-leather strap. Pure sophistication.",
    category: "Shoulder Bags",
    price: 389900n,
    stockQuantity: 7n,
    imageUrls: ["/assets/generated/bag-handbag.dim_600x600.jpg"],
    isActive: true,
    discountPercent: 20n,
    createdAt: BigInt(Date.now()) * 1000000n,
  },
];

export const ALL_CATEGORIES = [
  "All",
  // Bags
  "Handbags",
  "Backpacks",
  "Tote Bags",
  "Travel Bags",
  "Clutches",
  "Shoulder Bags",
  "Crossbody Bags",
  "Wallets",
  "Duffle Bags",
  "Kids Bags",
  // Clothing
  "Men's Clothing",
  "Women's Clothing",
  "Kids Clothing",
  "Traditional Wear",
  "Sportswear",
  // Footwear
  "Men's Shoes",
  "Women's Shoes",
  "Sandals",
  "Sports Shoes",
  "Kids Footwear",
  // Accessories
  "Sunglasses",
  "Belts",
  "Scarves",
  "Caps & Hats",
  "Ties",
  // Jewelry
  "Necklaces",
  "Earrings",
  "Bracelets",
  "Rings",
  "Bangles",
  // Home & Lifestyle
  "Home Decor",
  "Bedding",
  "Kitchen Items",
  "Candles & Fragrance",
  // Electronics
  "Mobile Accessories",
  "Earphones",
  "Smartwatches",
  // Beauty & Personal Care
  "Skincare",
  "Makeup",
  "Haircare",
  "Perfumes",
  // Sports & Fitness
  "Gym Equipment",
  "Yoga",
  "Outdoor Sports",
  // Books & Stationery
  "Books",
  "Notebooks",
  "Art Supplies",
  // Toys & Kids
  "Toys",
  "Educational Games",
  "Baby Products",
];

// Backward compatibility alias
export const BAG_CATEGORIES = ALL_CATEGORIES;

export function formatPrice(paise: bigint): string {
  const rupees = Number(paise) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function getDiscountedPrice(
  price: bigint,
  discountPercent: bigint,
): bigint {
  if (discountPercent === 0n) return price;
  return price - (price * discountPercent) / 100n;
}
