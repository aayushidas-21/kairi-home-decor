import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Layout } from "@/components/kairi/Layout";
import { formatINR } from "@/lib/store";

type Order = {
  orderNumber: string;
  email: string;
  name: string;
  total: number;
  itemCount: number;
  payMethod: "card" | "upi" | "cod";
  createdAt: string;
};

export const Route = createFileRoute("/order/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.id} — Kairi` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderConfirmation,
});

function OrderConfirmation() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kairi.lastOrder");
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const payLabel =
    order?.payMethod === "card"
      ? "Card"
      : order?.payMethod === "upi"
        ? "UPI"
        : order?.payMethod === "cod"
          ? "Cash on delivery"
          : "—";

  return (
    <Layout>
      <section className="mx-auto max-w-2xl px-6 py-24 text-center lg:px-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage/15 text-sage">
          <Check size={28} strokeWidth={1.6} />
        </div>
        <div className="eyebrow mt-8 text-sage">— Order confirmed</div>
        <h1 className="mt-4 font-serif text-5xl text-espresso md:text-6xl">
          Thank you{order?.name ? `, ${order.name.split(" ")[0]}` : ""}.
        </h1>
        <p className="mt-5 font-serif text-xl italic text-taupe">
          Your pieces are being gathered with care.
        </p>

        <div className="mx-auto mt-12 max-w-md rounded-2xl bg-parchment/70 p-6 text-left">
          <Row label="Order number" value={id} />
          {order && (
            <>
              <Row label="Confirmation sent to" value={order.email} />
              <Row label="Items" value={String(order.itemCount)} />
              <Row label="Payment" value={payLabel} />
              <Row label="Total" value={formatINR(order.total)} emphasis />
            </>
          )}
        </div>

        <p className="mx-auto mt-8 max-w-md text-sm text-espresso/70">
          You'll receive a confirmation email shortly. Most orders ship within 2–3 business days.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/shop"
            className="rounded-full bg-clay px-7 py-4 text-xs uppercase tracking-[0.22em] text-linen hover:bg-espresso"
          >
            Continue shopping
          </Link>
          <Link
            to="/"
            className="rounded-full border border-espresso px-7 py-4 text-xs uppercase tracking-[0.22em] text-espresso hover:bg-espresso hover:text-linen"
          >
            Back home
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-divider py-3 last:border-0">
      <span className="text-sm text-taupe">{label}</span>
      <span className={emphasis ? "font-serif text-xl text-espresso" : "text-sm text-espresso"}>
        {value}
      </span>
    </div>
  );
}
