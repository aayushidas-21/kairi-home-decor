import { X, Eye, Minus, Plus, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useStore, formatINR } from "@/lib/store";

export function QuickViewModal() {
  const { quickViewId, setQuickViewId, products, addToCart, toggleWishlist, wishlist, setCartOpen } = useStore();
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

  const product = products.find((p) => p.id === quickViewId);

  // Reset states on product change
  useEffect(() => {
    setQty(1);
    setSelectedColor(product?.colors?.[0]);
  }, [quickViewId, product]);

  if (!quickViewId || !product) return null;

  const liked = wishlist.includes(product.id);
  const currentImage = (selectedColor && product.colorImages?.[selectedColor]) || product.image;

  const handleClose = () => {
    setQuickViewId(null);
  };

  const handleAddToCart = () => {
    addToCart(product.id, qty);
    toast.success("Added to cart ✓", { description: product.name });
    setCartOpen(true);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        className="absolute inset-0 bg-espresso/30 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-linen border border-divider shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-linen/90 p-2 text-espresso hover:bg-parchment hover:text-clay transition-all shadow-sm focus:outline-none"
        >
          <X size={18} />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Product Image Panel */}
          <div className="relative aspect-[4/5] bg-parchment md:aspect-auto md:h-[520px]">
            <img 
              src={currentImage} 
              alt={product.name} 
              className="h-full w-full object-cover transition-all duration-500 ease-out"
            />
            {product.isNew && (
              <span className="absolute left-6 top-6 rounded-full bg-sage px-3 py-1 text-[9px] uppercase tracking-wider text-linen font-medium shadow-warm-sm">
                New Drop
              </span>
            )}
          </div>

          {/* Product Information Panel */}
          <div className="flex flex-col justify-between p-8 md:p-10">
            <div>
              <div className="eyebrow text-sage">— {product.category}</div>
              <h2 className="mt-3 font-serif text-3xl text-espresso md:text-4xl">{product.name}</h2>
              <p className="mt-2 font-serif text-base italic text-taupe">{product.descriptor}</p>
              
              <div className="mt-4 text-xl font-medium text-espresso">
                {formatINR(product.price)}
              </div>

              <div className="mt-6 border-t border-divider pt-6">
                <p className="text-sm leading-relaxed text-espresso/80">
                  {product.story}
                </p>
              </div>

              {product.care && (
                <div className="mt-4">
                  <span className="text-[10px] uppercase tracking-wider text-taupe block mb-1">Care & Handling</span>
                  <p className="text-xs text-taupe/90 italic">{product.care}</p>
                </div>
              )}

              {product.colors && (
                <div className="mt-4">
                  <span className="text-[10px] uppercase tracking-wider text-taupe block mb-1.5">Tone</span>
                  <div className="flex gap-2">
                    {product.colors.map((c: string) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        style={{ background: c }}
                        className={`h-6 w-6 rounded-full border transition-all ${
                          selectedColor === c ? "border-espresso scale-110 ring-1 ring-espresso" : "border-divider"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Panel */}
            <div className="mt-8 border-t border-divider pt-6 space-y-4">
              <div className="flex items-center gap-4">
                {/* Qty Selector */}
                <div className="flex items-center gap-1 rounded-full border border-divider px-3 py-1.5 bg-linen/50">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty === 1}
                    className="p-1 text-espresso/70 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="p-1 text-espresso/70 active:scale-95 transition-transform"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 rounded-full bg-clay py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium text-linen transition-colors hover:bg-espresso focus:outline-none"
                >
                  Add to cart
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                {/* Wishlist Button */}
                <button
                  onClick={() => {
                    toggleWishlist(product.id);
                    toast(liked ? "Removed from wishlist" : "Saved to wishlist ✦");
                  }}
                  className="inline-flex items-center gap-1.5 text-espresso/80 hover:text-clay transition-colors"
                >
                  <Heart size={14} className={liked ? "fill-clay text-clay" : ""} />
                  {liked ? "Saved to wishlist" : "Add to wishlist"}
                </button>

                {/* View Full Product */}
                <Link
                  to="/product/$id"
                  params={{ id: product.id }}
                  onClick={handleClose}
                  className="inline-flex items-center gap-1 text-clay font-medium border-b border-clay/35 pb-0.5 hover:text-espresso hover:border-espresso transition-all"
                >
                  <Eye size={12} /> View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
