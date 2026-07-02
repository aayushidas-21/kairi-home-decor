import { useEffect } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useStore, formatINR } from "@/lib/store";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeFromCart, products } = useStore();
  const items = cart.map((i) => ({ ...i, product: products.find((p) => p.id === i.id) })).filter((i) => i.product);
  const subtotal = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.qty, 0);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  return (
    <>
      <div
        onClick={() => setCartOpen(false)}
        className={`fixed inset-0 z-50 bg-espresso/30 backdrop-blur-sm transition-opacity ${
          cartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[440px] flex-col bg-linen shadow-2xl transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-divider px-6 py-5">
          <h2 className="font-serif text-2xl text-espresso">Your bag</h2>
          <button onClick={() => setCartOpen(false)} className="p-1 text-espresso/70 hover:text-clay">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <p className="font-serif text-2xl italic text-taupe">Your bag is empty.</p>
                <Link
                  to="/shop"
                  onClick={() => setCartOpen(false)}
                  className="mt-4 inline-block text-sm text-clay underline underline-offset-4"
                >
                  Start exploring →
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-divider">
              {items.map((i) => (
                <li key={i.id} className="flex gap-4 py-4">
                  <Link
                    to="/product/$id"
                    params={{ id: i.id }}
                    onClick={() => setCartOpen(false)}
                    className="block h-24 w-20 shrink-0 overflow-hidden rounded-md bg-parchment"
                  >
                    <img src={i.product!.image} alt={i.product!.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-espresso">{i.product!.name}</div>
                        <div className="truncate font-serif text-xs italic text-taupe">
                          {i.product!.descriptor}
                        </div>
                      </div>
                      <div className="shrink-0 text-sm text-espresso">{formatINR(i.product!.price * i.qty)}</div>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center gap-2 rounded-full border border-divider px-2 py-1">
                        <button
                          onClick={() => setQty(i.id, i.qty - 1)}
                          disabled={i.qty === 1}
                          className="p-0.5 text-espresso/70 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-xs">{i.qty}</span>
                        <button
                          onClick={() => setQty(i.id, i.qty + 1)}
                          className="p-0.5 text-espresso/70 active:scale-95 transition-transform"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(i.id)}
                        className="text-xs text-taupe hover:text-clay"
                        aria-label="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-divider bg-parchment/50 px-6 py-5">
            <div className="flex items-center justify-between text-sm text-espresso/80">
              <span>Subtotal</span>
              <span className="text-base font-medium text-espresso">{formatINR(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-taupe">Shipping calculated at checkout.</p>
            <Link
              to="/checkout"
              onClick={() => setCartOpen(false)}
              className="mt-4 block w-full rounded-full bg-clay px-6 py-4 text-center text-xs uppercase tracking-[0.2em] text-linen transition-colors hover:bg-espresso"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
