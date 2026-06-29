import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Layout } from "@/components/kairi/Layout";
import { ProductCard } from "@/components/kairi/ProductCard";
import { products, categories } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Kairi" },
      { name: "description", content: "Browse the full Kairi collection — handcrafted vases, cushions, wall art and candles." },
      { property: "og:title", content: "Shop — Kairi" },
      { property: "og:description", content: "Browse the full Kairi collection." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const [cat, setCat] = useState<string>("All");
  const [maxPrice, setMaxPrice] = useState(3500);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) => (cat === "All" || p.category === cat) && p.price <= maxPrice,
      ),
    [cat, maxPrice],
  );

  return (
    <Layout>
      <section className="border-b border-divider bg-parchment/40">
        <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
          <div className="eyebrow text-sage">— The Shop</div>
          <h1 className="mt-3 font-serif text-5xl text-espresso md:text-7xl">
            Everything, <span className="italic">in one place.</span>
          </h1>
          <p className="mt-4 max-w-xl text-espresso/70">
            Small-batch pieces from independent makers — filter by mood, price, or just browse.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[220px_1fr]">
          <aside className="space-y-8">
            <div>
              <h3 className="eyebrow text-taupe">Category</h3>
              <div className="mt-4 flex flex-wrap gap-2 md:flex-col md:gap-1">
                {(["All", ...categories.map((c) => c.name)] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={`rounded-full px-4 py-2 text-left text-sm transition-colors ${
                      cat === c
                        ? "bg-clay text-linen font-medium claymorphic-btn"
                        : "bg-parchment text-espresso/80 hover:text-clay"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="eyebrow text-taupe">Max price</h3>
              <input
                type="range"
                min={500}
                max={4000}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-4 w-full accent-clay"
              />
              <div className="mt-2 text-sm text-espresso/70">Up to ₹{maxPrice.toLocaleString("en-IN")}</div>
            </div>
            <div className="text-xs text-taupe">{filtered.length} pieces</div>
          </aside>

          <div>
            {filtered.length === 0 ? (
              <div className="grid h-80 place-items-center rounded-xl bg-parchment/40">
                <p className="font-serif text-2xl italic text-taupe">Nothing here yet — try a wider filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
