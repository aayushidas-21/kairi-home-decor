import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/kairi/Layout";
import { categories } from "@/lib/products";
import catVases from "@/assets/cat-vases.jpg";
import catCushions from "@/assets/cat-cushions.jpg";
import catWall from "@/assets/cat-wall.jpg";
import catCandles from "@/assets/cat-candles.jpg";

const map: Record<string, { img: string; tagline: string }> = {
  "Vases & Ceramics": { img: catVases, tagline: "Wheel-thrown stillness for everyday tables." },
  "Cushions & Throws": { img: catCushions, tagline: "Soft layers in linen, wool and slow-washed cotton." },
  "Wall Decor": { img: catWall, tagline: "Texture, shadow and a quiet kind of art." },
  "Candles & Scents": { img: catCandles, tagline: "Hand-poured rituals for slower evenings." },
};

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — Kairi" },
      { name: "description", content: "Explore Kairi's curated collections — vases, cushions, wall decor and candles." },
      { property: "og:title", content: "Collections — Kairi" },
      { property: "og:description", content: "Curated collections for intentional homes." },
    ],
  }),
  component: Collections,
});

function Collections() {
  return (
    <Layout>
      <section className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10">
        <div className="eyebrow text-sage">— Collections</div>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl text-espresso md:text-7xl">
          Small worlds, <span className="italic">carefully built.</span>
        </h1>
        <p className="mt-5 max-w-xl text-espresso/70">
          Four edits to help you find your corner. Each collection is curated around a feeling — quiet,
          tactile, lived-in.
        </p>
      </section>

      <section className="mx-auto max-w-[1400px] space-y-16 px-6 pb-24 lg:px-10">
        {categories.map((c, i) => (
          <Link
            key={c.slug}
            to="/shop"
            className={`group grid items-center gap-8 md:grid-cols-2 md:gap-14 ${
              i % 2 === 1 ? "md:[direction:rtl]" : ""
            }`}
          >
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-parchment md:[direction:ltr]">
              <img
                src={map[c.name].img}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.04]"
              />
            </div>
            <div className="md:[direction:ltr]">
              <div className="eyebrow text-clay">— Collection {String(i + 1).padStart(2, "0")}</div>
              <h2 className="mt-3 font-serif text-4xl text-espresso md:text-6xl">{c.name}</h2>
              <p className="mt-4 max-w-md font-serif text-xl italic text-taupe">{map[c.name].tagline}</p>
              <span className="mt-6 inline-block border-b border-clay pb-1 text-sm text-clay">
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </section>
    </Layout>
  );
}
