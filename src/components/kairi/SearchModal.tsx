import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useStore, formatINR } from "@/lib/store";

export function SearchModal() {
  const { searchOpen, setSearchOpen, products } = useStore();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!searchOpen) setQ("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products.slice(0, 4);
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.descriptor.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s),
    );
  }, [q, products]);

  if (!searchOpen) return null;

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-50 bg-espresso/40 backdrop-blur-md"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="mx-auto mt-24 max-w-2xl rounded-2xl bg-linen p-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-divider px-4 py-3">
          <Search size={18} className="text-taupe" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search vases, candles, cushions…"
            className="flex-1 bg-transparent text-base text-espresso placeholder:text-taupe focus:outline-none"
          />
          <button onClick={() => setSearchOpen(false)} className="p-1 text-taupe">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <div className="px-4 py-8 text-center font-serif text-lg italic text-taupe">
              Nothing here yet — try another word.
            </div>
          )}
          {results.map((p) => (
            <Link
              key={p.id}
              to="/product/$id"
              params={{ id: p.id }}
              onClick={() => setSearchOpen(false)}
              className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-parchment"
            >
              <img src={p.image} alt="" className="h-14 w-14 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-espresso">{p.name}</div>
                <div className="truncate font-serif text-xs italic text-taupe">{p.category}</div>
              </div>
              <div className="text-sm text-espresso">{formatINR(p.price)}</div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
