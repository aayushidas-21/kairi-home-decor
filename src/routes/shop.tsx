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
  { name: "Vases & Ceramics", img: catVases },
  { name: "Cushions & Throws", img: catCushions },
  { name: "Wall Decor", img: catWall },
  { name: "Candles & Scents", img: catCandles },
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
        <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
          <div className="eyebrow text-sage">— The Shop</div>
          <h1 className="mt-2.5 font-serif text-4xl text-espresso md:text-6xl">
            Everything, <span className="italic">in one place.</span>
          </h1>
          <p className="mt-3 max-w-xl text-espresso/70 text-sm">
            Small-batch pieces from independent makers — browse categories or filter by price.
          </p>
        </div>
      </section>

      {/* Visual Collections - Compact Highlight Circles (Lessen Collections) */}
      <section className="mx-auto max-w-[1400px] px-6 pt-10 pb-4 lg:px-10">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {/* "All" Highlight Circle */}
          <button
            onClick={() => setCat("All")}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className={`h-16 w-16 md:h-20 md:w-20 rounded-full border-2 overflow-hidden flex items-center justify-center bg-linen transition-all duration-300 ${
              cat === "All" 
                ? "border-clay ring-4 ring-clay/10 scale-105" 
                : "border-divider group-hover:border-clay/50"
            }`}>
              <span className="font-serif text-xs uppercase tracking-wider text-espresso">All</span>
            </div>
            <span className={`mt-2 text-[11px] uppercase tracking-wider transition-colors ${
              cat === "All" ? "text-clay font-medium" : "text-espresso/70 group-hover:text-espresso"
            }`}>
              All
            </span>
          </button>

          {/* Category Highlight Circles */}
          {collectionsData.map((c) => (
            <button
              key={c.name}
              onClick={() => setCat(c.name)}
              className="group flex flex-col items-center focus:outline-none"
            >
              <div className={`h-16 w-16 md:h-20 md:w-20 rounded-full border-2 overflow-hidden transition-all duration-300 ${
                cat === c.name 
                  ? "border-clay ring-4 ring-clay/10 scale-105" 
                  : "border-divider group-hover:border-clay/50"
              }`}>
                <img
                  src={c.img}
                  alt={c.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className={`mt-2 text-[11px] uppercase tracking-wider transition-colors ${
                cat === c.name ? "text-clay font-medium" : "text-espresso/70 group-hover:text-espresso"
            }`}>
              {c.name.split(" & ")[0]}
            </span>
          </button>
          ))}
        </div>
      </section>

      {/* Interactive Catalog Section (More of Shop) */}
      <section id="store-catalog" className="mx-auto max-w-[1400px] px-6 py-6 pb-20 lg:px-10">
        
        {/* Top Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-y border-divider py-4 mb-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-taupe">Filter:</span>
            <span className="font-serif italic text-espresso text-sm">{cat} Collection</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 sm:gap-8">
            {/* Price Slider */}
            <div className="flex items-center gap-3 min-w-[200px] flex-1 sm:flex-initial">
              <span className="text-[10px] uppercase tracking-wider text-taupe whitespace-nowrap">Max Price:</span>
              <input
                type="range"
                min={500}
                max={4000}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-clay cursor-pointer h-1.5 rounded-lg appearance-none bg-divider"
              />
              <span className="text-xs font-semibold text-espresso min-w-[50px] text-right">₹{maxPrice}</span>
            </div>

            <div className="text-[10px] uppercase tracking-wider text-taupe ml-auto">{filtered.length} pieces</div>
          </div>
        </div>

        {/* Product Grid - Full Width 4-column layout */}
        <div>
          {filtered.length === 0 ? (
            <div className="grid h-80 place-items-center rounded-xl bg-parchment/40">
              <p className="font-serif text-2xl italic text-taupe">Nothing here yet — try a wider filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
