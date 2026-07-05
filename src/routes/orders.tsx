import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import { 
  ShoppingBag, Package, Truck, CheckCircle2, XCircle, Clock, 
  ArrowLeft, CreditCard, ChevronRight 
} from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/kairi/Layout";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { useStore, formatINR } from "@/lib/store";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order History — Kairi" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersHistory,
});

type OrderItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type Order = {
  id: string;
  orderNumber: string;
  email: string;
  name: string;
  total: number;
  itemCount: number;
  payMethod: "card" | "upi" | "cod";
  createdAt: string;
  status: "processing" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
};

function OrdersHistory() {
  const { user, loading } = useAuth();
  const { products } = useStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    async function loadOrders() {
      try {
        const q = query(collection(db, "orders"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const list: Order[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Order);
        });
        // Sort in memory by createdAt desc (prevents composite index requirements in Firestore)
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(list);
      } catch (err) {
        console.error("Failed to load customer orders:", err);
        toast.error("Failed to load your order history.");
      } finally {
        setFetching(false);
      }
    }

    loadOrders();
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    const isConfirm = window.confirm("Are you sure you want to cancel this order? This action cannot be undone.");
    if (!isConfirm) return;

    try {
      const orderRef = doc(db, "orders", orderId);
      await setDoc(orderRef, { status: "cancelled" }, { merge: true });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
      toast.success("Order has been cancelled successfully ✦");
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  if (loading || fetching) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
          <p className="text-sm font-serif italic text-taupe animate-pulse">Gathering your history...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="mx-auto max-w-[1000px] px-6 py-12 lg:px-10">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-taupe hover:text-espresso transition-colors mb-3">
              <ArrowLeft size={12} /> Storefront
            </Link>
            <h1 className="font-serif text-4xl text-espresso tracking-tight md:text-5xl">
              Order <span className="italic">History.</span>
            </h1>
            <p className="text-xs text-taupe mt-1.5 leading-relaxed">Review past collections and track active shipments.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-divider bg-white/20 p-12 text-center">
            <ShoppingBag className="mx-auto text-taupe/60 mb-4" size={32} strokeWidth={1.2} />
            <h3 className="font-serif text-lg text-espresso font-semibold">No orders yet</h3>
            <p className="text-xs text-taupe mt-1 max-w-sm mx-auto">Once you acquire Kairi home decor pieces, they will appear here.</p>
            <Link
              to="/shop"
              className="mt-6 inline-block rounded-full bg-clay px-6 py-3 text-xs uppercase tracking-wider text-linen hover:bg-espresso transition-all"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                products={products} 
                onCancel={() => handleCancelOrder(order.id)} 
              />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

// 3D Parallax Tilt Order Card Component
function OrderCard({ 
  order, 
  products, 
  onCancel 
}: { 
  order: Order; 
  products: any[]; 
  onCancel: () => void; 
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Subtle rotation to preserve usability of buttons
    const rotateX = ((centerY - y) / centerY) * 4;
    const rotateY = ((x - centerX) / centerX) * 4;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const payLabel =
    order.payMethod === "card"
      ? "Card"
      : order.payMethod === "upi"
        ? "UPI"
        : order.payMethod === "cod"
          ? "Cash on delivery"
          : "—";

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: hovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)",
        transition: hovered ? "transform 0.05s ease-out, shadow 0.3s" : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), shadow 0.3s"
      }}
      className="rounded-2xl border border-divider bg-white/45 backdrop-blur-md p-6 shadow-warm-sm transition-all duration-300 hover:shadow-warm-md"
    >
      {/* Card Top */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-divider pb-4 mb-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-taupe">Order Ref</span>
          <h3 className="font-mono font-medium text-clay text-sm mt-0.5">{order.orderNumber}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-taupe">Date Placed</span>
            <p className="text-xs text-espresso font-semibold mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <OrderTimeline status={order.status} />

      {/* Order Items Section */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-wider text-taupe block">Acquired Pieces</span>
          <div className="space-y-2">
            {order.items?.map((item) => {
              const matchedProd = products.find(p => p.id === item.id);
              const imgUrl = matchedProd?.image || "/placeholder.jpg";
              return (
                <div key={item.id} className="flex items-center gap-3 bg-linen/35 border border-divider/50 rounded-xl p-2">
                  <img 
                    src={imgUrl} 
                    alt={item.name} 
                    className="h-10 w-10 rounded-lg object-cover bg-parchment" 
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-espresso truncate">{item.name}</h4>
                    <p className="text-[10px] text-taupe mt-0.5">Qty: {item.qty} × {formatINR(item.price)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Billing Summary */}
        <div className="bg-parchment/30 rounded-2xl border border-divider p-4 flex flex-col justify-between">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-taupe">Payment Method</span>
              <span className="font-semibold text-espresso uppercase flex items-center gap-1"><CreditCard size={12} /> {payLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-taupe">Total Item Count</span>
              <span className="font-semibold text-espresso">{order.itemCount} units</span>
            </div>
          </div>
          <div className="border-t border-divider pt-3 mt-3 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-taupe block">Grand Total</span>
              <span className="font-serif text-2xl font-bold text-espresso">{formatINR(order.total)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CancelButton 
                createdAt={order.createdAt} 
                orderId={order.id} 
                status={order.status} 
                onCancel={onCancel} 
              />
              <Link
                to="/order/$id"
                params={{ id: order.orderNumber }}
                className="text-[10px] uppercase tracking-wider font-semibold bg-espresso hover:bg-clay text-linen rounded-full px-4 py-2 transition-all flex items-center gap-1 shadow-warm-sm"
              >
                Track details <ChevronRight size={10} />
              </Link>
            </div>
          </div>
        </div>
      </div>
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
      <div className="flex items-center gap-2 text-red-500 bg-red-50/50 border border-red-100 rounded-xl p-3.5 mt-2 animate-in fade-in duration-300">
        <XCircle size={15} />
        <span className="text-xs font-semibold uppercase tracking-wider">This order has been cancelled and is no longer being processed.</span>
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
    <div className="mt-4 bg-linen/20 border border-divider/40 rounded-xl p-4">
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
                      : "bg-linen border-divider text-taupe/80"
                  }`}
                  title={step.label}
                >
                  <Icon size={14} />
                </div>
                <span className={`text-[9px] uppercase tracking-wider mt-1.5 font-semibold transition-all duration-300 ${
                  isActive ? "text-espresso" : "text-taupe/80"
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

// Cancellation countdown timer button
function CancelButton({ 
  createdAt, 
  orderId, 
  status, 
  onCancel 
}: { 
  createdAt: string; 
  orderId: string; 
  status: string; 
  onCancel: () => void; 
}) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (status === "cancelled" || status === "shipped" || status === "delivered") {
      setTimeLeft(null);
      return;
    }

    const checkTimer = () => {
      const createdTime = new Date(createdAt).getTime();
      const now = Date.now();
      const twoHours = 2 * 60 * 60 * 1000;
      const elapsed = now - createdTime;
      const remaining = twoHours - elapsed;

      if (remaining <= 0) {
        setTimeLeft(null);
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        let label = "";
        if (hours > 0) label += `${hours}h `;
        label += `${minutes}m `;
        label += `${seconds}s`;
        
        setTimeLeft(label);
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [createdAt, status]);

  if (!timeLeft) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }}
      className="text-[10px] uppercase tracking-wider font-semibold border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-full px-4 py-2 transition-all flex items-center gap-1 focus:outline-none"
    >
      <Clock size={11} /> Cancel ({timeLeft})
    </button>
  );
}
