import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronDown, Heart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/kairi/Layout";
import { ProductCard } from "@/components/kairi/ProductCard";
import { getProduct } from "@/lib/products";
import { useStore, formatINR } from "@/lib/store";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    let product = getProduct(params.id);
    if (!product) {
      try {
        const snap = await getDoc(doc(db, "products", params.id));
        if (snap.exists()) {
          product = snap.data() as any;
        }
      } catch (err) {
        console.error("Firestore lookup failed:", err);
      }
    }
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Kairi` },
          { name: "description", content: loaderData.product.descriptor },
          { property: "og:title", content: `${loaderData.product.name} — Kairi` },
          { property: "og:description", content: loaderData.product.descriptor },
          { property: "og:image", content: loaderData.product.image },
          { name: "twitter:image", content: loaderData.product.image },
        ]
      : [{ title: "Product — Kairi" }],
  }),
  notFoundComponent: () => (
    <Layout>
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-serif text-5xl italic text-espresso">Not found.</h1>
        <Link to="/shop" className="mt-6 inline-block text-clay underline">Back to shop</Link>
      </div>
    </Layout>
  ),
  component: PDP,
});

function PDP() {
  const { product } = Route.useLoaderData();
  const { addToCart, toggleWishlist, wishlist, setCartOpen, products } = useStore();
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(product.colors?.[0]);
  const [open, setOpen] = useState<string | null>("details");
  const liked = wishlist.includes(product.id);

  const recs = products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <Layout>
      <div className="mx-auto max-w-[1400px] px-6 pt-8 lg:px-10">
        <nav className="text-xs text-taupe">
          <Link to="/" className="hover:text-clay">Home</Link> ·{" "}
          <Link to="/shop" className="hover:text-clay">Shop</Link> ·{" "}
          <span className="text-espresso/70">{product.category}</span>
        </nav>
      </div>

      <section className="mx-auto grid max-w-[1400px] gap-12 px-6 py-10 md:grid-cols-2 md:gap-16 lg:px-10">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-parchment">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            {color && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-20 transition-all duration-300"
                style={{ backgroundColor: color }}
              />
            )}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {(product.images ?? [product.image]).map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-md bg-parchment opacity-80">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="md:pt-4">
          <div className="eyebrow text-sage">— {product.category}</div>
          <h1 className="mt-3 font-serif text-5xl text-espresso md:text-6xl">{product.name}</h1>
          <p className="mt-3 font-serif text-xl italic text-taupe">{product.descriptor}</p>
          <div className="mt-6 text-2xl text-espresso">{formatINR(product.price)}</div>

          {product.colors && (
            <div className="mt-8">
              <div className="eyebrow text-taupe">Tone</div>
              <div className="mt-3 flex gap-2.5">
                {product.colors.map((c: string) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    aria-label={c}
                    style={{ background: c }}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      color === c ? "border-espresso scale-110" : "border-divider"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="flex items-center gap-2 rounded-full border border-divider px-3 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty === 1}
                className="p-2 text-espresso/70 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="p-2 text-espresso/70 active:scale-95 transition-transform"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => {
                addToCart(product.id, qty);
                toast.success("Added to cart ✓", { description: product.name });
                setCartOpen(true);
              }}
              className="flex-1 rounded-full bg-clay px-7 py-4 text-xs uppercase tracking-[0.22em] text-linen transition-colors hover:bg-espresso"
            >
              Add to cart
            </button>
          </div>

          <button
            onClick={() => {
              toggleWishlist(product.id);
              toast(liked ? "Removed from wishlist" : "Saved to wishlist ✦");
            }}
            className="mt-4 inline-flex items-center gap-2 text-sm text-espresso/80 underline-offset-4 hover:text-clay hover:underline"
          >
            <Heart size={14} className={liked ? "fill-clay text-clay" : ""} /> Add to wishlist
          </button>

          <div className="mt-10 border-t border-divider">
            {[
              { key: "details", label: "Product Details", body: product.story },
              { key: "care", label: "Care Instructions", body: product.care },
              {
                key: "shipping",
                label: "Shipping Info",
                body:
                  "Dispatched within 2–3 business days. Free shipping above ₹999. 7-day easy returns on unused items.",
              },
            ].map((sec) => (
              <div key={sec.key} className="border-b border-divider">
                <button
                  onClick={() => setOpen(open === sec.key ? null : sec.key)}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <span className="text-sm font-medium text-espresso">{sec.label}</span>
                  <ChevronDown
                    size={16}
                    className={`text-taupe transition-transform ${open === sec.key ? "rotate-180" : ""}`}
                  />
                </button>
                {open === sec.key && (
                  <p className="pb-5 text-sm leading-relaxed text-espresso/75">{sec.body}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-20 lg:px-10">
        <h2 className="mb-10 font-serif text-4xl italic text-espresso md:text-5xl">
          You Might Also Love
        </h2>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {recs.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
