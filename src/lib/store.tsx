import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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

  useEffect(() => {
    setCart(read<CartItem[]>("kairi.cart", []));
    setWishlist(read<string[]>("kairi.wishlist", []));
    setHydrated(true);
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
    }),
    [cart, wishlist, cartOpen, searchOpen],
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
