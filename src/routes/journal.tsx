import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/kairi/Layout";
import brandStory from "@/assets/brand-story.jpg";
import catVases from "@/assets/cat-vases.jpg";
import catCandles from "@/assets/cat-candles.jpg";

const posts = [
  {
    title: "Five Ways to Style a Single Vase",
    excerpt: "On the quiet power of one object, repeated through a home.",
    date: "June 14, 2026",
    tag: "Styling",
    img: catVases,
  },
  {
    title: "The Slow Living Edit: Evenings",
    excerpt: "Small rituals — a candle, a throw, a cup — to soften the end of a day.",
    date: "May 28, 2026",
    tag: "Slow Living",
    img: catCandles,
  },
  {
    title: "Meet the Maker: A Studio in Pondicherry",
    excerpt: "Inside the wheel-thrown world of our ceramics partner.",
    date: "May 9, 2026",
    tag: "Makers",
    img: brandStory,
  },
];

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — Kairi" },
      { name: "description", content: "Slow living notes, styling ideas, and stories from the makers behind Kairi." },
      { property: "og:title", content: "Journal — Kairi" },
      { property: "og:description", content: "Slow living notes from Kairi." },
    ],
  }),
  component: Journal,
});

function Journal() {
  return (
    <Layout>
      <section className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10">
        <div className="eyebrow text-sage">— Journal</div>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl text-espresso md:text-7xl">
          Notes on <span className="italic">slow living.</span>
        </h1>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-24 lg:px-10">
        <div className="grid gap-10 md:grid-cols-3">
          {posts.map((p) => (
            <article key={p.title} className="group">
              <div className="aspect-[4/5] overflow-hidden rounded-xl bg-parchment">
                <img
                  src={p.img}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-5 flex items-center gap-3 text-xs text-taupe">
                <span className="eyebrow text-sage">{p.tag}</span>
                <span>·</span>
                <span>{p.date}</span>
              </div>
              <h2 className="mt-3 font-serif text-2xl text-espresso transition-colors group-hover:text-clay md:text-[1.7rem]">
                {p.title}
              </h2>
              <p className="mt-2 font-serif text-base italic text-taupe">{p.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}
