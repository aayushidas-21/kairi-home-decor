import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Layout } from "@/components/kairi/Layout";
import { ProductCard } from "@/components/kairi/ProductCard";
import { products, categories } from "@/lib/products";

// Curated Collection assets & metadata
import catVases from "@/assets/cat-vases.jpg";
import catCushions from "@/assets/cat-cushions.jpg";
import catWall from "@/assets/cat-wall.jpg";
import catCandles from "@/assets/cat-candles.jpg";

const collectionsData = [
  { name: "Vases & Ceramics", img: catVases, tagline: "Wheel-thrown stillness for everyday tables." },
  { name: "Cushions & Throws", img: catCushions, tagline: "Soft layers in linen, wool and slow-washed cotton." },
  { name: "Wall Decor", img: catWall, tagline: "Texture, shadow and a quiet kind of art." },
  { name: "Candles & Scents", img: catCandles, tagline: "Hand-poured rituals for slower evenings." },
];

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop & Collections — Kairi" },
      { name: "description", content: "Explore curated collections and shop handcrafted vases, cushions, wall art, and candles." },
      { property: "og:title", content: "Shop & Collections — Kairi" },
      { property: "og:description", content: "Explore curated collections for intentional homes." },
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
      {/* Hero Header Section */}
      <section className="border-b border-divider bg-parchment/40">
        <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
          <div className="eyebrow text-sage">— Curated Shop</div>
          <h1 className="mt-3 font-serif text-5xl text-espresso md:text-7xl">
            Everything, <span className="italic">in one place.</span>
          </h1>
          <p className="mt-4 max-w-xl text-espresso/70">
            Small-batch pieces from independent makers — explore our visual collections below or filter by category and price.
          </p>
        </div>
      </section>

      {/* Visual Collections Section */}
      <section className="mx-auto max-w-[1400px] px-6 py-14 lg:px-10 border-b border-divider">
        <div className="mb-10">
          <div className="eyebrow text-clay">— Curated Collections</div>
          <h2 className="mt-3 font-serif text-3xl text-espresso md:text-4xl">
            Small worlds, <span className="italic">carefully built.</span>
          </h2>
          <p className="mt-3 max-w-xl text-taupe text-sm">
            Curated around tactile feelings of quietness and slower living. Select any collection to filter the store catalog automatically.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collectionsData.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setCat(c.name);
                // Scroll down smoothly to the store catalog grid
                const target = document.getElementById("store-catalog");
                if (target) {
                  target.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group text-left border border-divider rounded-2xl overflow-hidden bg-linen/25 transition-all hover:shadow-md hover:border-clay/40 focus:outline-none"
            >
              <div className="aspect-[4/3] overflow-hidden bg-parchment relative">
                <img
                  src={c.img}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg text-espresso group-hover:text-clay transition-colors">{c.name}</h3>
                <p className="mt-2 text-xs text-taupe leading-relaxed font-serif italic">{c.tagline}</p>
                <span className="mt-4 inline-flex items-center text-[10px] uppercase tracking-wider text-clay border-b border-clay pb-0.5">
                  Explore & Filter →
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Interactive Catalog Section */}
      <section id="store-catalog" className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 scroll-mt-24">
        <div className="grid gap-10 md:grid-cols-[220px_1fr]">
          {/* Sidebar Filters */}
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
            <div className="text-xs text-taupe">{filtered.length} pieces found</div>
          </aside>

          {/* Product Grid */}
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
