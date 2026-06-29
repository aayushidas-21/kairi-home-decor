import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Product } from "@/lib/products";
import { useStore, formatINR } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const liked = wishlist.includes(product.id);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 6;
    const rotateY = ((x - centerX) / centerX) * 6;
    setTilt({ x: rotateY, y: -rotateX });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className="group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(${
          tilt.x !== 0 || tilt.y !== 0 ? 1.025 : 1
        }, ${tilt.x !== 0 || tilt.y !== 0 ? 1.025 : 1}, 1)`,
        transition:
          tilt.x === 0 && tilt.y === 0
            ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
            : "transform 0.08s ease-out"
      }}
    >
      <div className="relative overflow-hidden rounded-xl bg-parchment claymorphic-card shadow-warm-sm">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="block aspect-[4/5] w-full"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={900}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        </Link>
        <button
          aria-label="Wishlist"
          onClick={() => {
            toggleWishlist(product.id);
            toast(liked ? "Removed from wishlist" : "Saved to wishlist ✦");
          }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-linen/85 text-espresso opacity-60 md:opacity-0 backdrop-blur transition-all group-hover:opacity-100 hover:bg-linen"
        >
          <Heart
            size={15}
            strokeWidth={1.6}
            className={liked ? "fill-clay text-clay" : ""}
          />
        </button>
        <button
          onClick={() => {
            addToCart(product.id, 1);
            toast.success("Added to cart ✓", { description: product.name });
          }}
          className="absolute inset-x-3 bottom-3 translate-y-12 rounded-full bg-espresso px-4 py-3 text-xs uppercase tracking-[0.18em] text-linen opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Add to cart
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            className="block truncate text-[0.95rem] font-medium text-espresso transition-colors hover:text-clay"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 truncate font-serif text-sm italic text-espresso/65">{product.descriptor}</p>
        </div>
        <div className="shrink-0 text-[0.95rem] text-espresso">{formatINR(product.price)}</div>
      </div>
    </div>
  );
}
