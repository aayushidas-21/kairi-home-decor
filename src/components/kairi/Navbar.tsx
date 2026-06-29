import { Link } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "About" },
  { to: "/journal", label: "Journal" },
] as const;

export function Navbar() {
  const { setCartOpen, setSearchOpen, cartCount, wishlist } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all ${
        scrolled
          ? "border-divider bg-linen/75 backdrop-blur-xl"
          : "border-transparent bg-linen/40 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between gap-6 px-6 lg:px-10">
        <Link to="/" className="font-serif text-3xl tracking-tight text-espresso md:text-[2rem]">
          Kairi
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[0.92rem] text-espresso/80 transition-colors hover:text-clay"
              activeProps={{ className: "text-clay" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="rounded-full p-2.5 text-espresso/80 transition-colors hover:bg-parchment hover:text-clay focus-visible:ring-2 focus-visible:ring-clay focus-visible:outline-none"
          >
            <Search size={18} strokeWidth={1.6} />
          </button>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative rounded-full p-2.5 text-espresso/80 transition-colors hover:bg-parchment hover:text-clay focus-visible:ring-2 focus-visible:ring-clay focus-visible:outline-none"
          >
            <Heart size={18} strokeWidth={1.6} />
            {wishlist.length > 0 && (
              <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-clay text-[10px] font-medium text-linen">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button
            aria-label="Cart"
            onClick={() => setCartOpen(true)}
            className="relative rounded-full p-2.5 text-espresso/80 transition-colors hover:bg-parchment hover:text-clay focus-visible:ring-2 focus-visible:ring-clay focus-visible:outline-none"
          >
            <ShoppingBag size={18} strokeWidth={1.6} />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-clay text-[10px] font-medium text-linen">
                {cartCount}
              </span>
            )}
          </button>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="ml-1 rounded-full p-2.5 text-espresso/80 md:hidden focus-visible:ring-2 focus-visible:ring-clay focus-visible:outline-none"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-divider bg-linen md:hidden">
          <div className="flex flex-col px-6 py-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 text-espresso/85"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
