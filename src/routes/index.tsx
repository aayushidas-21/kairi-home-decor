import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/kairi/Layout";
import { ProductCard } from "@/components/kairi/ProductCard";
import { products, categories } from "@/lib/products";
import hero from "@/assets/hero.jpg";
import brandStory from "@/assets/brand-story.jpg";
import catVases from "@/assets/cat-vases.jpg";
import catCushions from "@/assets/cat-cushions.jpg";
import catWall from "@/assets/cat-wall.jpg";
import catCandles from "@/assets/cat-candles.jpg";

const categoryImages: Record<string, string> = {
  "Vases & Ceramics": catVases,
  "Cushions & Throws": catCushions,
  "Wall Decor": catWall,
  "Candles & Scents": catCandles,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kairi — Intentional spaces, everyday beauty" },
      {
        name: "description",
        content:
          "Handpicked indie home decor — handcrafted vases, cushions, wall art, candles and curated pieces for the intentional home.",
      },
      { property: "og:title", content: "Kairi — Spaces that feel like you" },
      {
        property: "og:description",
        content: "Handpicked home decor for the intentional home.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <Layout>
      <Hero />
      <Marquee />
      <NewArrivals />
      <Categories />
      <BrandStory />
      <Bestsellers />
      <Testimonials />
      <Instagram />
      <Newsletter />
    </Layout>
  );
}

function Hero() {
  return (
    <section className="grain relative h-[90vh] min-h-[640px] w-full overflow-hidden">
      <img
        src={hero}
        alt="Sunlit linen table with a hand-thrown ceramic vase"
        width={1600}
        height={1100}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-linen/40 via-transparent to-linen/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-linen/60 via-transparent to-transparent" />

      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6 lg:px-16">
        <div className="eyebrow text-clay">— Est. 2026, India</div>
        <h1 className="mt-5 max-w-3xl font-serif text-[3.5rem] leading-[0.95] text-espresso md:text-[6.5rem] lg:text-[7.5rem]">
          <span className="font-light">Spaces That</span>
          <br />
          <span className="italic">
            Feel Like <span className="text-clay">You.</span>
          </span>
        </h1>
        <p className="mt-8 max-w-md text-base text-espresso/75 md:text-lg">
          Handpicked home decor for the intentional home — small batches, slow craft, and pieces
          made to live with.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 rounded-full bg-clay px-7 py-4 text-xs uppercase tracking-[0.22em] text-linen transition-all hover:bg-espresso"
          >
            Shop Now
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 rounded-full border border-espresso px-7 py-4 text-xs uppercase tracking-[0.22em] text-espresso transition-all hover:bg-espresso hover:text-linen"
          >
            Explore Collections
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block">
        <div className="flex flex-col items-center gap-2 text-taupe">
          <span className="eyebrow">Scroll</span>
          <div className="h-10 w-px bg-taupe/50" />
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Handcrafted Pieces",
    "Ethically Sourced",
    "Free Shipping Over ₹999",
    "7-Day Easy Returns",
    "Small Batch Collections",
  ];
  const row = [...items, ...items, ...items, ...items];
  return (
    <section className="overflow-hidden border-y border-divider bg-parchment/40 py-5">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="eyebrow flex items-center gap-12 text-taupe">
            <span className="text-clay">✦</span> {t}
          </span>
        ))}
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10">
      <div className="mb-12 flex items-end justify-between gap-6">
        <div>
          <div className="eyebrow text-sage">— Curated for you</div>
          <h2 className="mt-3 font-serif text-5xl italic text-espresso md:text-6xl">Shop by Mood</h2>
        </div>
        <Link
          to="/shop"
          className="hidden text-sm text-espresso/70 underline-offset-4 hover:text-clay hover:underline md:block"
        >
          See all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to="/shop"
            className="group relative block aspect-[3/4] overflow-hidden rounded-xl bg-parchment shadow-warm-sm"
          >
            <img
              src={categoryImages[c.name]}
              alt={c.name}
              loading="lazy"
              width={800}
              height={1000}
              className="h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/10 to-transparent transition-opacity group-hover:from-espresso/85" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="font-serif text-2xl text-linen md:text-[1.6rem]">{c.name}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-linen/80">
                Explore <ArrowRight size={12} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function NewArrivals() {
  const items = products.filter((p) => p.isNew).slice(0, 8);
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
      <div className="mb-12 flex items-end justify-between gap-6">
        <div>
          <h2 className="font-serif text-5xl text-espresso md:text-6xl">
            Just In
            <span className="ml-3 inline-block h-[3px] w-16 translate-y-[-12px] bg-sage" />
          </h2>
          <p className="mt-3 max-w-md font-serif text-lg italic text-taupe">
            New pieces that just landed in the studio.
          </p>
        </div>
        <Link
          to="/shop"
          className="hidden text-sm text-espresso/70 underline-offset-4 hover:text-clay hover:underline md:block"
        >
          Shop all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="mx-auto mt-12 max-w-[1400px] px-6 py-16 lg:px-10">
      <div className="grid items-center gap-10 overflow-hidden rounded-2xl bg-parchment md:grid-cols-2 shadow-warm">
        <div className="aspect-[5/6] w-full overflow-hidden md:aspect-auto md:h-full">
          <img
            src={brandStory}
            alt="Sunlit corner with linen and a ceramic vase"
            loading="lazy"
            width={1200}
            height={1400}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="px-8 py-12 md:px-14 md:py-20">
          <div className="eyebrow text-sage">— Our Story</div>
          <h2 className="mt-5 font-serif text-4xl text-espresso md:text-[3.2rem] md:leading-[1.05]">
            Made for Homes That <span className="italic">Have a Soul.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-espresso/75">
            Kairi is a small studio of pieces handpicked from independent makers across India.
            We believe in slow living, in objects with fingerprints, and in spaces that quietly
            tell the story of the people who live there.
          </p>
          <Link
            to="/about"
            className="mt-8 inline-flex items-center gap-2 border-b-[1.5px] border-clay pb-1 text-sm font-medium text-clay transition-colors hover:text-espresso hover:border-espresso"
          >
            Meet Kairi <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Bestsellers() {
  const items = [...products.filter((p) => p.bestseller), ...products].slice(0, 8);
  const ref = useRef<HTMLDivElement | null>(null);
  const scroll = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sage/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-sage">
            ✦ Loved by 2,000+ homes
          </div>
          <h2 className="mt-4 font-serif text-5xl text-espresso md:text-6xl">Community Favourites</h2>
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            onClick={() => scroll(-1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-divider text-espresso transition-colors hover:bg-espresso hover:text-linen"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="grid h-11 w-11 place-items-center rounded-full border border-divider text-espresso transition-colors hover:bg-espresso hover:text-linen"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((p, idx) => (
          <div key={`${p.id}-${idx}`} className="w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-[26%]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    {
      quote:
        "Every piece I've collected from Kairi feels like it was waiting for my home. The vase on my console is my favourite thing.",
      name: "Ananya R.",
      city: "Bengaluru",
    },
    {
      quote:
        "The linen cushions are the softest I've ever owned. Three washes in and they only get better.",
      name: "Meera S.",
      city: "Mumbai",
    },
    {
      quote:
        "I light my Dusk candle every evening. It's become a small ritual I look forward to all day.",
      name: "Karan V.",
      city: "Delhi",
    },
  ];
  return (
    <section className="bg-parchment/80 py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="mb-12 text-center">
          <div className="eyebrow text-sage">— Kind Words</div>
          <h2 className="mt-3 font-serif text-5xl text-espresso md:text-6xl">
            From <span className="italic">our community.</span>
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <figure
              key={i}
              className="rounded-2xl bg-linen/95 p-8 shadow-warm transition-transform hover:-translate-y-1"
            >
              <div className="flex gap-0.5 text-clay">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="mt-5 font-serif text-xl italic leading-snug text-espresso md:text-[1.4rem]">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-6 text-sm text-espresso/65">
                {r.name} · {r.city}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Instagram() {
  const imgs = [catVases, brandStory, catCushions, catWall, catCandles, hero];
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow text-sage">— Tagged with #KairiHome</div>
          <h2 className="mt-3 font-serif text-5xl italic text-espresso md:text-6xl">Your Kairi Home</h2>
        </div>
        <a
          href="https://instagram.com"
          className="text-sm text-espresso/70 underline-offset-4 hover:text-clay hover:underline"
        >
          @kairi_home →
        </a>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {imgs.map((src, i) => (
          <a key={i} href="#" className="group block aspect-square overflow-hidden rounded-lg bg-parchment">
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.06]"
            />
          </a>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="bg-parchment-deep py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <div className="eyebrow text-sage">— The Slow Letter</div>
        <h2 className="mt-4 font-serif text-4xl text-espresso md:text-[3rem] md:leading-[1.05]">
          A Little Inspiration, <span className="italic">In Your Inbox.</span>
        </h2>
        <p className="mt-5 text-base text-espresso/70">
          New drops, styling tips, and slow living ideas — once a week, never more.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLFormElement).reset();
            toast.success("You are on the list! ✦");
          }}
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            placeholder="you@home.com"
            className="flex-1 rounded-full border border-divider bg-linen px-5 py-4 text-sm text-espresso placeholder:text-taupe focus:border-clay focus:outline-none"
          />
          <button className="rounded-full bg-clay px-7 py-4 text-xs uppercase tracking-[0.22em] text-linen transition-colors hover:bg-espresso">
            Join
          </button>
        </form>
        <p className="mt-4 text-xs text-taupe">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
