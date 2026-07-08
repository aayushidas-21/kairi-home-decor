import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { products as staticProducts, type Product } from "@/lib/products";

type CartItem = { id: string; qty: number };

type StoreCtx = {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  toggleWishlist: (id: string) => void;
  cartCount: number;
  products: Product[];
  loadingProducts: boolean;
  quickViewId: string | null;
  setQuickViewId: (id: string | null) => void;
  hydrated: boolean;
};

const Ctx = createContext<StoreCtx | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  
  // Dynamic Firestore products state with local fallback
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  useEffect(() => {
    setCart(read<CartItem[]>("kairi.cart", []));
    setWishlist(read<string[]>("kairi.wishlist", []));
    setHydrated(true);
  }, []);

  // Fetch products dynamically from Firestore with static fallbacks
  useEffect(() => {
    async function fetchProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const firestoreProductIds = new Set<string>();
        const list: Product[] = [];

        querySnapshot.forEach((d) => {
          const data = d.data() as Product;
          const staticMatch = staticProducts.find((p) => p.id === data.id);
          
          // Prefer remote uploads (http/https/data) from Firestore; otherwise fallback to Vite's bundled static asset
          const validImage = 
            data.image && (data.image.startsWith("http://") || data.image.startsWith("https://") || data.image.startsWith("data:"))
              ? data.image
              : (staticMatch?.image || data.image);

          list.push({
            ...staticMatch,
            ...data,
            image: validImage,
            colorImages: data.colorImages || staticMatch?.colorImages,
            colors: data.colors || staticMatch?.colors,
            stock: data.stock !== undefined ? data.stock : 50
          });
          firestoreProductIds.add(data.id);
        });

        // Add any static product missing in Firestore to in-memory list (no DB write overhead)
        for (const p of staticProducts) {
          if (!firestoreProductIds.has(p.id)) {
            list.push(p);
          }
        }
        setProducts(list.length > 0 ? list : staticProducts);
      } catch (error) {
        console.error("Error fetching products from Firestore:", error);
        setProducts(staticProducts);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("kairi.cart", JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem("kairi.wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const value = useMemo<StoreCtx>(
    () => ({
      cart,
      wishlist,
      cartOpen,
      searchOpen,
      setCartOpen,
      setSearchOpen,
      addToCart: (id, qty = 1) =>
        setCart((prev) => {
          const existing = prev.find((i) => i.id === id);
          if (existing) return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
          return [...prev, { id, qty }];
        }),
      removeFromCart: (id) => setCart((prev) => prev.filter((i) => i.id !== id)),
      setQty: (id, qty) =>
        setCart((prev) =>
          qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
        ),
      toggleWishlist: (id) =>
        setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      cartCount: cart.reduce((s, i) => s + i.qty, 0),
      products,
      loadingProducts,
      quickViewId,
      setQuickViewId,
      hydrated,
    }),
    [cart, wishlist, cartOpen, searchOpen, products, loadingProducts, quickViewId, hydrated],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
};

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
