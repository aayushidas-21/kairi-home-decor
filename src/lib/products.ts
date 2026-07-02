import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import p7 from "@/assets/p7.jpg";
import p8 from "@/assets/p8.jpg";
import p9 from "@/assets/p9.jpg";
import p10 from "@/assets/p10.jpg";
import p11 from "@/assets/p11.jpg";
import p12 from "@/assets/p12.jpg";
import p13 from "@/assets/p13.jpg";
import p14 from "@/assets/p14.jpg";
import p15 from "@/assets/p15.jpg";
import p16 from "@/assets/p16.jpg";
import p17 from "@/assets/p17.jpg";
import p18 from "@/assets/p18.jpg";
import p19 from "@/assets/p19.jpg";
import p20 from "@/assets/p20.jpg";

export type Product = {
  id: string;
  name: string;
  descriptor: string;
  price: number;
  image: string;
  images?: string[];
  category: "Vases & Ceramics" | "Cushions & Throws" | "Wall Decor" | "Candles & Scents";
  colors?: string[];
  bestseller?: boolean;
  isNew?: boolean;
  story: string;
  care: string;
};

export const products: Product[] = [
  {
    id: "ceramic-bud-vase",
    name: "Mira Bud Vase",
    descriptor: "Hand-thrown stoneware",
    price: 1490,
    image: p1,
    category: "Vases & Ceramics",
    colors: ["#EDE2D2", "#B5845A", "#2C2420"],
    isNew: true,
    bestseller: true,
    story:
      "Wheel-thrown in small batches by a studio in Pondicherry. Each piece carries the soft fingerprints of its maker — no two ever quite the same.",
    care: "Wipe with a soft, dry cloth. Hand wash only. Not microwave safe.",
  },
  {
    id: "linen-cushion-oat",
    name: "Aanvi Linen Cushion",
    descriptor: "Stonewashed oat linen, 18×18",
    price: 1290,
    image: p2,
    category: "Cushions & Throws",
    colors: ["#EDE2D2", "#7A8C6E", "#B5845A"],
    isNew: true,
    story:
      "Woven from European flax linen and softened with a slow stonewash for a lived-in drape from day one.",
    care: "Machine wash cold, gentle cycle. Tumble dry low. Cover only — insert sold separately.",
  },
  {
    id: "rattan-wall-mirror",
    name: "Surya Rattan Mirror",
    descriptor: "Handwoven cane, 24\" round",
    price: 3290,
    image: p3,
    category: "Wall Decor",
    isNew: true,
    bestseller: true,
    story:
      "A nod to mid-century cane work, woven by artisans in Kerala over the course of three days per piece.",
    care: "Dust gently. Keep away from prolonged direct sunlight to preserve the cane.",
  },
  {
    id: "amber-soy-candle",
    name: "Dusk Soy Candle",
    descriptor: "Sandalwood, amber, oud — 45hr burn",
    price: 990,
    image: p4,
    category: "Candles & Scents",
    isNew: true,
    story:
      "Hand-poured in amber glass with a clean-burning soy and coconut wax blend. Notes of warm sandalwood, smoked amber, and a whisper of oud.",
    care: "Trim wick to 5mm before each burn. Never leave unattended.",
  },
  {
    id: "macrame-hanging",
    name: "Saanjh Macramé",
    descriptor: "Hand-knotted cotton on teak",
    price: 1890,
    image: p5,
    category: "Wall Decor",
    isNew: true,
    story:
      "Knotted by hand in soft natural cotton on a hand-turned teak dowel. A quiet, tactile centerpiece for any bare wall.",
    care: "Spot clean. Gently comb fringe to refresh.",
  },
  {
    id: "terracotta-planter",
    name: "Miti Terracotta Planter",
    descriptor: "Unglazed clay, 5\" pot",
    price: 690,
    image: p6,
    category: "Vases & Ceramics",
    isNew: true,
    story:
      "Slow-fired terracotta from Khurja, breathable and porous — exactly how indoor plants like to live.",
    care: "Add a saucer to protect surfaces. Develops a beautiful patina with age.",
  },
  {
    id: "pampas-bunch",
    name: "Pampas Bundle",
    descriptor: "Naturally dried, ~24\" stems",
    price: 1190,
    image: p7,
    category: "Vases & Ceramics",
    isNew: true,
    story:
      "Sun-dried pampas in their natural cream. A lifetime arrangement that asks nothing of you.",
    care: "Shake gently to refresh. Keep away from humidity.",
  },
  {
    id: "woven-throw",
    name: "Anaya Throw Blanket",
    descriptor: "Handloom cotton, fringe edge",
    price: 2490,
    image: p8,
    category: "Cushions & Throws",
    bestseller: true,
    story:
      "Woven on traditional handlooms in Panipat with soft mercerised cotton and a generous fringed edge.",
    care: "Machine wash cold, line dry. Iron on low if needed.",
  },
  {
    id: "ceramic-indigo-cup",
    name: "Neel Indigo Cup",
    descriptor: "Studio pottery, indigo glaze",
    price: 890,
    image: p9,
    category: "Vases & Ceramics",
    colors: ["#2C2420", "#EDE2D2"],
    isNew: true,
    story:
      "Individually glazed and fired in a wood-fired kiln in Pondicherry, giving it a deep, unique indigo texture and earthy feel.",
    care: "Dishwasher safe. Handle with care.",
  },
  {
    id: "wool-throw-beige",
    name: "Kaya Wool Blanket",
    descriptor: "Fleece wool blend, natural fringe",
    price: 2890,
    image: p10,
    category: "Cushions & Throws",
    colors: ["#EDE2D2", "#B5845A"],
    bestseller: true,
    story:
      "A heavy, comforting blend of organic sheep's wool and natural cotton, handloom-woven by traditional artisans in Himachal Pradesh.",
    care: "Dry clean only. Gentle spot clean with mild detergent.",
  },
  {
    id: "brass-wall-hanging",
    name: "Tara Brass Hanging",
    descriptor: "Hand-beaten recycled brass",
    price: 1590,
    image: p11,
    category: "Wall Decor",
    isNew: true,
    story:
      "Delicate geometric shapes beaten by hand from recycled brass sheets by master metalsmiths in Jaipur.",
    care: "Dust with a dry microfibre cloth. Avoid dampness.",
  },
  {
    id: "mogra-incense",
    name: "Mogra Incense Cones",
    descriptor: "Jasmine & Mogra, 30 cones",
    price: 490,
    image: p12,
    category: "Candles & Scents",
    isNew: true,
    bestseller: true,
    story:
      "Hand-rolled using natural dried flower dust and pure essential oils in Mysore. Clean-burning, soothing and charcoal-free.",
    care: "Burn in a well-ventilated space. Keep away from flammable materials and children.",
  },
  {
    id: "terracotta-kulhar",
    name: "Kesar Chai Kulhar (Set of 2)",
    descriptor: "Earthy clay cups, set of 2",
    price: 790,
    image: p13,
    category: "Vases & Ceramics",
    isNew: true,
    story:
      "Clay-molded and sun-baked in Uttar Pradesh. Reusable, rustic cups that hold heat perfectly and add a natural clay aroma to your tea.",
    care: "Wash gently with warm water, no soap. Air dry thoroughly.",
  },
  {
    id: "jute-cushion-cover",
    name: "Kavi Jute Cushion",
    descriptor: "Braided jute and cotton, 16×16",
    price: 1190,
    image: p14,
    category: "Cushions & Throws",
    bestseller: true,
    story:
      "Interwoven golden jute fibers and thick cream cotton, handcrafted by weavers in West Bengal.",
    care: "Spot clean or dry clean only. Do not wash.",
  },
  {
    id: "terracotta-wall-plates",
    name: "Mural Clay Plates (Set of 3)",
    descriptor: "Hand-painted terracotta plates",
    price: 2190,
    image: p15,
    category: "Wall Decor",
    isNew: true,
    story:
      "A set of three hand-painted wall plates featuring abstract botanical lines, created by folk artists in Bihar.",
    care: "Dust with a dry cloth. Ready to hang.",
  },
  {
    id: "vetiver-mist",
    name: "Khus Root Mist",
    descriptor: "Pure vetiver root water, 100ml",
    price: 1390,
    image: p16,
    category: "Candles & Scents",
    isNew: true,
    story:
      "Steam-distilled from wild vetiver (Khus) roots in Kannauj. A cooling, earthy aroma mist for linens and spaces.",
    care: "Store in a cool, dark place. Spray from a distance of 10 inches.",
  },
  {
    id: "linen-curtains-cream",
    name: "Aanya Linen Curtains",
    descriptor: "100% Belgian flax linen, custom drape",
    price: 3490,
    image: p17,
    category: "Cushions & Throws",
    isNew: true,
    bestseller: true,
    story:
      "Woven from premium organic Belgian flax and tailored in our studio. Filters light softly while adding an airy, natural linen texture.",
    care: "Dry clean recommended. Gentle machine wash cold if needed. Iron on warm while damp.",
  },
  {
    id: "linen-curtains-rust",
    name: "Soham Terracotta Curtains",
    descriptor: "Stonewashed linen curtains",
    price: 3690,
    image: p18,
    category: "Cushions & Throws",
    isNew: true,
    story:
      "Stonewashed for unmatched softness and draped in a rich, earthy terracotta tone. Brings warmth and character to minimalist rooms.",
    care: "Dry clean only. Hang immediately to preserve the natural linen drape.",
  },
  {
    id: "brass-abstract-showpiece",
    name: "Dhyana Brass Showpiece",
    descriptor: "Abstract geometric tabletop sculpture",
    price: 2290,
    image: p19,
    category: "Wall Decor",
    bestseller: true,
    story:
      "A hand-welded abstract sculpture crafted from brass sheet metal. Features clean lines, organic geometry, and a polished warm glow.",
    care: "Wipe with a soft dry cloth. Avoid exposure to moisture to prevent tarnish.",
  },
  {
    id: "wabi-sabi-clay-sculptures",
    name: "Wabi-Sabi Clay Sculptures (Set of 2)",
    descriptor: "Unglazed textured clay shapes",
    price: 1990,
    image: p20,
    category: "Vases & Ceramics",
    isNew: true,
    story:
      "A set of two primitive, organic unglazed stoneware shapes. Designed to bring wabi-sabi calmness and rustic texture to your console or shelf.",
    care: "Handle with clean dry hands. Clean dust using a soft dry brush.",
  },
];

export const categories = [
  { name: "Vases & Ceramics", slug: "vases-ceramics" },
  { name: "Cushions & Throws", slug: "cushions-throws" },
  { name: "Wall Decor", slug: "wall-decor" },
  { name: "Candles & Scents", slug: "candles-scents" },
] as const;

export const getProduct = (id: string) => products.find((p) => p.id === id);
