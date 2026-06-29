import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/kairi/Layout";
import { ProductCard } from "@/components/kairi/ProductCard";
import { products } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Kairi" },
      { name: "description", content: "Pieces you're saving for later." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useStore();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <Layout>
      <section className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10">
        <div className="eyebrow text-sage">— Saved</div>
        <h1 className="mt-3 font-serif text-5xl text-espresso md:text-7xl">
          Your <span className="italic">wishlist.</span>
        </h1>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-24 lg:px-10">
        {items.length === 0 ? (
          <div className="grid place-items-center rounded-2xl bg-parchment/50 py-24 text-center">
            <p className="font-serif text-2xl italic text-taupe">Nothing saved yet.</p>
            <Link to="/shop" className="mt-4 inline-block text-clay underline">
              Start exploring →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
