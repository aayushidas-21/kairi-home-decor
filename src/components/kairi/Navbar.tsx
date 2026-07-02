import { Link } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag, Menu, X, User, LogOut, Shield } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "About" },
  { to: "/journal", label: "Journal" },
] as const;

export function Navbar() {
  const { setCartOpen, setSearchOpen, cartCount, wishlist } = useStore();
  const { user, profile, role, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
          {/* Search Button */}
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="rounded-full p-2.5 text-espresso/80 transition-colors hover:bg-parchment hover:text-clay focus-visible:ring-2 focus-visible:ring-clay focus-visible:outline-none"
          >
            <Search size={18} strokeWidth={1.6} />
          </button>

          {/* Wishlist Button */}
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

          {/* Cart Button */}
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

          {/* Auth Dropdown / Login Button */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            {user ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center rounded-full p-2.5 text-espresso/80 transition-colors hover:bg-parchment hover:text-clay focus-visible:ring-2 focus-visible:ring-clay focus-visible:outline-none"
                  aria-label="Account Menu"
                >
                  <User size={18} strokeWidth={1.6} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-divider bg-linen p-4 shadow-lg ring-1 ring-black/5 z-50">
                    <div className="border-b border-divider pb-2.5 mb-2.5">
                      <p className="text-[11px] uppercase tracking-wider text-taupe">Signed in as</p>
                      <p className="font-serif text-sm text-espresso font-medium truncate mt-0.5">
                        {profile?.fullName || "Kairi Customer"}
                      </p>
                      <p className="text-xs text-taupe truncate">{user.email}</p>
                    </div>
                    
                    <ul className="space-y-1">
                      {role === "admin" && (
                        <li>
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs uppercase tracking-wider text-espresso/85 hover:bg-parchment hover:text-clay transition-colors"
                          >
                            <Shield size={14} /> Admin Dashboard
                          </Link>
                        </li>
                      )}
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs uppercase tracking-wider text-espresso/85 hover:bg-parchment hover:text-red-500 transition-colors text-left focus:outline-none"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center rounded-full p-2.5 text-espresso/80 transition-colors hover:bg-parchment hover:text-clay focus-visible:ring-2 focus-visible:ring-clay focus-visible:outline-none"
                aria-label="Sign In"
              >
                <User size={18} strokeWidth={1.6} />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="ml-1 rounded-full p-2.5 text-espresso/80 md:hidden focus-visible:ring-2 focus-visible:ring-clay focus-visible:outline-none"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {open && (
        <div className="border-t border-divider bg-linen md:hidden">
          <div className="flex flex-col px-6 py-4 space-y-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2.5 text-espresso/85 text-sm uppercase tracking-wider"
              >
                {l.label}
              </Link>
            ))}

            {/* Mobile Auth Items */}
            <div className="border-t border-divider pt-4 mt-2">
              {user ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-taupe">Account</p>
                    <p className="font-serif text-sm text-espresso font-medium mt-0.5">
                      {profile?.fullName || "Kairi Customer"}
                    </p>
                    <p className="text-xs text-taupe">{user.email}</p>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    {role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 text-xs uppercase tracking-wider text-clay"
                      >
                        <Shield size={14} /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 text-xs uppercase tracking-wider text-red-500 text-left focus:outline-none"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-espresso/85 hover:text-clay py-1"
                >
                  <User size={14} /> Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
