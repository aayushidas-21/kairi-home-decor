import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Check, ShoppingBag, Package, Truck, CheckCircle2, XCircle, Clock 
} from "lucide-react";
import { useEffect, useState } from "react";
import { Layout } from "@/components/kairi/Layout";
import { formatINR } from "@/lib/store";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

type Order = {
  id?: string;
  orderNumber: string;
  email: string;
  name: string;
  total: number;
  itemCount: number;
  payMethod: "card" | "upi" | "cod";
  createdAt: string;
  status?: "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";
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
  const { user } = useAuth();

  const loadOrder = async () => {
    try {
      // Try Firestore first
      const orderSnap = await getDoc(doc(db, "orders", id));
      if (orderSnap.exists()) {
        setOrder({ id: orderSnap.id, ...orderSnap.data() } as Order);
        return;
      }
    } catch (err) {
      console.error("Failed to load order from Firestore, falling back to session storage:", err);
    }

    // Fallback to sessionStorage
    try {
      const raw = sessionStorage.getItem("kairi.lastOrder");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.orderNumber === id) {
          setOrder(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    const isConfirm = window.confirm("Are you sure you want to cancel this order? This action cannot be undone.");
    if (!isConfirm) return;

    try {
      const { updateDoc } = await import("firebase/firestore");
      const orderId = order.id || order.orderNumber;
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "cancelled" });
      setOrder(prev => prev ? { ...prev, status: "cancelled" } : null);
      toast.success("Order has been cancelled successfully ✦");
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

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
      <section className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage/15 text-sage shadow-warm-sm">
          <Check size={28} strokeWidth={1.6} />
        </div>
        <div className="eyebrow mt-8 text-sage">— Order status</div>
        <h1 className="mt-4 font-serif text-5xl text-espresso md:text-6xl">
          Thank you{order?.name ? `, ${order.name.split(" ")[0]}` : ""}.
        </h1>
        <p className="mt-5 font-serif text-xl italic text-taupe">
          Your pieces are being gathered with care.
        </p>

        {order?.status && (
          <div className="mt-8 max-w-md mx-auto">
            <OrderTimeline status={order.status} />
          </div>
        )}

        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-divider bg-parchment/40 p-6 text-left shadow-warm-sm">
          <Row label="Order number" value={id} />
          {order && (
            <>
              <Row label="Confirmation sent to" value={order.email} />
              <Row label="Items" value={String(order.itemCount)} />
              <Row label="Payment" value={payLabel} />
              {order.status && (
                <div className="flex items-baseline justify-between border-b border-divider py-3 last:border-0">
                  <span className="text-sm text-taupe">Status</span>
                  <StatusBadge status={order.status} />
                </div>
              )}
              <Row label="Total" value={formatINR(order.total)} emphasis />
            </>
          )}
        </div>

        {order && order.status && (
          <div className="mt-6 flex justify-center">
            <CancelButton 
              createdAt={order.createdAt} 
              status={order.status} 
              onCancel={handleCancelOrder} 
            />
          </div>
        )}

        <p className="mx-auto mt-8 max-w-md text-sm text-espresso/70">
          You'll receive a confirmation email shortly. Most orders ship within 2–3 business days.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/orders"
            className="rounded-full bg-clay px-7 py-4 text-xs uppercase tracking-[0.22em] text-linen hover:bg-espresso shadow-warm-sm"
          >
            View all orders
          </Link>
          <Link
            to="/shop"
            className="rounded-full border border-espresso px-7 py-4 text-xs uppercase tracking-[0.22em] text-espresso hover:bg-espresso hover:text-linen"
          >
            Continue shopping
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

// Order Status Badge
function StatusBadge({ status }: { status: string }) {
  const getStyle = () => {
    switch (status) {
      case "processing":
        return "bg-amber-50 border-amber-200 text-amber-600";
      case "confirmed":
        return "bg-sage/10 border-sage/20 text-sage";
      case "shipped":
        return "bg-indigo-50 border-indigo-150 text-indigo-600";
      case "delivered":
        return "bg-green-50 border-green-200 text-green-600";
      case "cancelled":
        return "bg-red-50 border-red-200 text-red-500";
      default:
        return "bg-linen border-divider text-espresso";
    }
  };

  return (
    <span className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-warm-sm ${getStyle()}`}>
      {status}
    </span>
  );
}

// Timeline tracker component
function OrderTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center justify-center gap-2 text-red-500 bg-red-50/50 border border-red-100 rounded-xl p-3.5 mt-2 animate-in fade-in duration-300">
        <XCircle size={15} />
        <span className="text-xs font-semibold uppercase tracking-wider">This order has been cancelled</span>
      </div>
    );
  }

  const steps = [
    { label: "Placed", status: "processing", icon: ShoppingBag },
    { label: "Confirmed", status: "confirmed", icon: Package },
    { label: "Shipped", status: "shipped", icon: Truck },
    { label: "Delivered", status: "delivered", icon: CheckCircle2 },
  ];

  const getStepIndex = (currentStatus: string) => {
    if (currentStatus === "processing") return 0;
    if (currentStatus === "confirmed") return 1;
    if (currentStatus === "shipped") return 2;
    if (currentStatus === "delivered") return 3;
    return 0;
  };

  const activeIndex = getStepIndex(status);

  return (
    <div className="bg-linen/25 border border-divider/40 rounded-xl p-4">
      <div className="flex items-center justify-between w-full">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i <= activeIndex;
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center relative">
                <div 
                  className={`h-8 w-8 rounded-full border grid place-items-center transition-all duration-300 ${
                    isActive 
                      ? "bg-clay border-clay text-linen shadow-warm-sm" 
                      : "bg-linen border-divider text-taupe/85"
                  }`}
                  title={step.label}
                >
                  <Icon size={14} />
                </div>
                <span className={`text-[9px] uppercase tracking-wider mt-1.5 font-semibold transition-all duration-300 ${
                  isActive ? "text-espresso" : "text-taupe/85"
                }`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 px-2 -mt-4">
                  <div className="relative h-1 bg-divider rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-clay transition-all duration-700 ease-in-out"
                      style={{ width: i < activeIndex ? "100%" : "0%" }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Cancellation button (disappears after 2 hours)
function CancelButton({ 
  createdAt, 
  status, 
  onCancel 
}: { 
  createdAt: string; 
  status: string; 
  onCancel: () => void; 
}) {
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    if (status === "cancelled" || status === "shipped" || status === "delivered") {
      setShowCancel(false);
      return;
    }

    const checkTimer = () => {
      const createdTime = new Date(createdAt).getTime();
      const now = Date.now();
      const twoHours = 2 * 60 * 60 * 1000;
      const elapsed = now - createdTime;
      const remaining = twoHours - elapsed;

      if (remaining <= 0) {
        setShowCancel(false);
      } else {
        setShowCancel(true);
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 10000);
    return () => clearInterval(interval);
  }, [createdAt, status]);

  if (!showCancel) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }}
      className="text-xs uppercase tracking-wider font-semibold border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-full px-5 py-2.5 transition-all flex items-center gap-1.5 focus:outline-none shadow-warm-sm animate-in zoom-in duration-300"
    >
      Cancel Order
    </button>
  );
}
