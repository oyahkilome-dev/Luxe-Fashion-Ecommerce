export interface ProductVariant {
  id: string;
  sku: string;
  color: string;
  size: string;
  stock_quantity: number;
  price_adjustment: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  colors?: string[];
  sizes?: string[];
  stockQuantity?: number;
  variants?: ProductVariant[];
}

export const mockProducts: Product[] = [
  {
    id: "a7e3d015-dec8-4992-b7ce-782c9e3792c7",
    name: "Luxury Chronograph Watch",
    description: "A premium chronograph watch with a sleek stainless steel band and sapphire crystal face. Water-resistant up to 50 meters.",
    price: 499.99,
    originalPrice: 650.00,
    images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1000"],
    category: "Watches",
    brand: "LuxeTime",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: "866db17c-6dae-48d5-95b1-0d6d88a4d5ce",
    name: "Designer Leather Handbag",
    description: "Handcrafted from genuine Italian leather. Features a spacious interior with multiple compartments and a detachable shoulder strap.",
    price: 299.99,
    images: ["https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=1000"],
    category: "Bags",
    brand: "Aura",
    rating: 4.9,
    reviews: 89,
    inStock: true,
    isFeatured: true,
    colors: ["Black", "Brown", "Tan"],
  },
  {
    id: "c1fdae15-0f5e-4038-b360-2fd44fb9f3a4",
    name: "Minimalist Gold Necklace",
    description: "18k solid gold chain with a minimalist geometric pendant. Perfect for layering or everyday wear.",
    price: 150.00,
    images: ["https://images.unsplash.com/photo-1599643477874-5c866f5c0977?auto=format&fit=crop&q=80&w=1000"],
    category: "Jewelry",
    brand: "Glow",
    rating: 4.7,
    reviews: 56,
    inStock: true,
  },
  {
    id: "f0af10ba-30b5-4f14-b915-24d359c8c436",
    name: "Classic White Sneakers",
    description: "Premium leather sneakers with an ultra-comfortable memory foam insole. The ultimate everyday shoe.",
    price: 89.99,
    originalPrice: 110.00,
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1000"],
    category: "Shoes",
    brand: "Stride",
    rating: 4.5,
    reviews: 210,
    inStock: true,
    sizes: ["7", "8", "9", "10", "11", "12"],
  },
  {
    id: "1cafbefd-367e-4545-82fb-d42c4d6fe49a",
    name: "Silk Blend Evening Gown",
    description: "Elegant silk blend gown featuring a flattering draped neckline and a high slit. Perfect for formal events.",
    price: 345.00,
    images: ["https://images.unsplash.com/photo-1566160983995-10499e1cba56?auto=format&fit=crop&q=80&w=1000"],
    category: "Women's Fashion",
    brand: "Elegance",
    rating: 4.6,
    reviews: 42,
    inStock: true,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Navy", "Emerald", "Ruby"],
    isNew: true,
  },
  {
    id: "98126868-6c49-4071-bd63-526f95adae31",
    name: "Premium Matte Lipstick Set",
    description: "A collection of 3 highly pigmented, long-lasting matte lipsticks. Enriched with vitamin E to keep lips hydrated.",
    price: 45.00,
    images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=1000"],
    category: "Cosmetics",
    brand: "Lumiere",
    rating: 4.9,
    reviews: 315,
    inStock: true,
  },
  {
    id: "5bd4c556-fe0b-424a-a151-d5b7fecf6f55",
    name: "Men's Tailored Wool Suit",
    description: "A sharp, tailored suit crafted from premium wool blend. Includes jacket and trousers.",
    price: 420.00,
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1000"],
    category: "Men's Fashion",
    brand: "Sharpe",
    rating: 4.8,
    reviews: 78,
    inStock: true,
    sizes: ["38R", "40R", "42R", "44R"],
    colors: ["Charcoal", "Navy", "Black"],
  },
  {
    id: "75e3d9dd-dbe7-42ca-97f1-7bdfa82b6757",
    name: "Polarized Aviator Sunglasses",
    description: "Classic aviator sunglasses with polarized lenses for ultimate UV protection and glare reduction.",
    price: 125.00,
    originalPrice: 160.00,
    images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=1000"],
    category: "Fashion Accessories",
    brand: "Optic",
    rating: 4.5,
    reviews: 190,
    inStock: true,
  },
  {
    id: "5eea5522-78c6-4b43-bd75-fd2d03bae527",
    name: "Stylish Men Shoes Collection",
    description: "Premium stylish men's shoes, perfect for both formal and casual settings.",
    price: 110.00,
    images: ["https://i.ibb.co/zH7yXRxX/Stylish-Men-Shoes-Collection-menshoes-sneakersmen-formalshoes-stylishshoes-shoestyle-menstyle.jpg"],
    category: "Men's Fashion",
    brand: "Luxe",
    rating: 4.6,
    reviews: 45,
    inStock: true,
    sizes: ["8", "9", "10", "11"],
    colors: ["Brown", "Black"],
  },
  {
    id: "6f5961c7-bb93-428a-9452-6b68baa00588",
    name: "Shirt Pant Co-ord Set Mens",
    description: "Comfortable and stylish shirt and pant co-ord set for men. Great for smart-casual wear.",
    price: 135.00,
    images: ["https://i.ibb.co/qwmZNGp/Shirt-Pant-Co-ord-Set-Mens.jpg"],
    category: "Men's Fashion",
    brand: "TrendSetter",
    rating: 4.7,
    reviews: 62,
    inStock: true,
    sizes: ["M", "L", "XL"],
    colors: ["Navy", "Beige"],
    isNew: true,
  },
  {
    id: "c286018b-dfc9-44a3-8b2c-d664ee4252d9",
    name: "Astrilon Co Men's Fit",
    description: "Astrilon Co modern fit collection. Sleek lines and premium fabrics for the modern man.",
    price: 85.00,
    images: ["https://i.ibb.co/SDsd0TLv/Astrilon-Co.jpg"],
    category: "Men's Fashion",
    brand: "Astrilon Co",
    rating: 4.5,
    reviews: 38,
    inStock: true,
    sizes: ["S", "M", "L"],
    colors: ["Black", "Grey"],
  },
  {
    id: "3014a665-ac87-41c8-8680-218cd8aaf85a",
    name: "Best Outfit for Men",
    description: "Curated best outfit combo. Effortless style and premium quality for any occasion.",
    price: 210.00,
    originalPrice: 250.00,
    images: ["https://i.ibb.co/49BF7kV/Best-Outfit-for-men.jpg"],
    category: "Men's Fashion",
    brand: "Elite",
    rating: 4.9,
    reviews: 112,
    inStock: true,
    sizes: ["M", "L", "XL"],
    colors: ["Assorted"],
  }
];
