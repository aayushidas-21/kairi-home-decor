import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/kairi/Layout";
import brandStory from "@/assets/brand-story.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Kairi" },
      { name: "description", content: "Kairi is a small studio of pieces handpicked from independent makers across India." },
      { property: "og:title", content: "About — Kairi" },
      { property: "og:description", content: "Slow craft, small batches, intentional homes." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10">
        <div className="eyebrow text-sage">— Our Story</div>
        <h1 className="mt-4 font-serif text-5xl text-espresso md:text-7xl">
          Quiet objects, <span className="italic">loved homes.</span>
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-espresso/75">
          Kairi began in a small studio in Siliguri with one stubborn idea — that the things in our homes
          should feel like they belong to us. We work with independent makers across India, in clay, linen,
          cane and wax, to bring you small-batch pieces that are made slowly and carry the gentle marks of
          the hands that made them.
        </p>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-parchment">
          <img src={brandStory} alt="The Kairi studio" loading="lazy" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-12 px-6 py-24 md:grid-cols-3 lg:px-10">
        {[
          {
            t: "Slow",
            b: "Small batches, never rushed. We'd rather ship later than ship something we don't love.",
          },
          {
            t: "Local",
            b: "Every piece is made by an independent maker in India, paid fairly and credited where we can.",
          },
          {
            t: "Lived-in",
            b: "Our pieces are made to be used. To gather small scratches, soft fades and the patina of a life.",
          },
        ].map((v) => (
          <div key={v.t}>
            <h3 className="font-serif text-3xl italic text-clay">{v.t}.</h3>
            <p className="mt-3 text-sm leading-relaxed text-espresso/75">{v.b}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 text-center lg:px-10">
        <h2 className="font-serif text-3xl italic text-espresso md:text-4xl">Say hello.</h2>
        <p className="mt-3 text-espresso/70">
          Have a question or custom request? Get in touch with our studio team.
        </p>
        <Link
          to="/contact"
          className="mt-6 inline-block border-b border-clay pb-1 text-clay hover:text-espresso hover:border-espresso transition-colors"
        >
          Contact Us →
        </Link>
      </section>
    </Layout>
  );
}
