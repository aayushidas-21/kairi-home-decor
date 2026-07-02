import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ShieldAlert, ShoppingBag, Users, IndianRupee, ChevronRight, LogOut } from "lucide-react";
import { Layout } from "@/components/kairi/Layout";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { formatINR } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Kairi" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

type AdminOrder = {
  id: string;
  orderNumber: string;
  name: string;
  email: string;
  total: number;
  itemCount: number;
  payMethod: string;
  createdAt: string;
  status: string;
};

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
};

function AdminDashboard() {
  const { user, role, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "users">("orders");

  useEffect(() => {
    if (loading) return;

    if (!user || role !== "admin") {
      setFetching(false);
      return;
    }

    async function fetchData() {
      try {
        // Fetch Orders
        const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const ordersSnap = await getDocs(ordersQuery);
        const fetchedOrders: AdminOrder[] = [];
        ordersSnap.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() } as AdminOrder);
        });
        setOrders(fetchedOrders);

        // Fetch Users
        const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const usersSnap = await getDocs(usersQuery);
        const fetchedUsers: AdminUser[] = [];
        usersSnap.forEach((doc) => {
          fetchedUsers.push({ id: doc.id, ...doc.data() } as AdminUser);
        });
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setFetching(false);
      }
    }

    fetchData();
  }, [user, role, loading]);

  if (loading || (user && role === "admin" && fetching)) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-clay border-t-transparent mx-auto"></div>
            <p className="mt-4 font-serif text-lg italic text-taupe">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || role !== "admin") {
    return (
      <Layout>
        <section className="mx-auto max-w-md px-6 py-24 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-500 mb-6">
            <ShieldAlert size={28} />
          </div>
          <h1 className="font-serif text-3xl text-espresso">Access Denied</h1>
          <p className="mt-4 text-sm text-taupe leading-relaxed">
            You must be signed in as an administrator to view this page. If you have an admin account, please sign in.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/login"
              className="rounded-full bg-clay px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-linen hover:bg-espresso"
            >
              Sign In to Admin
            </Link>
            <Link
              to="/"
              className="rounded-full border border-espresso px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-espresso hover:bg-linen"
            >
              Return Home
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  // KPIs
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;
  const totalRegisteredUsers = users.length;

  return (
    <Layout>
      <section className="mx-auto max-w-[1280px] px-6 py-12 lg:px-10">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-divider pb-8">
          <div>
            <div className="eyebrow text-clay">— Store Management</div>
            <h1 className="mt-3 font-serif text-4xl text-espresso md:text-5xl">
              Admin <span className="italic">Dashboard</span>
            </h1>
          </div>
          <button
            onClick={() => logout().then(() => navigate({ to: "/" }))}
            className="flex items-center gap-2 rounded-full border border-divider px-5 py-2.5 text-xs uppercase tracking-wider text-espresso/80 hover:bg-parchment focus:outline-none"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-3 mb-10">
          <div className="rounded-xl border border-divider bg-linen/35 p-6 flex items-center gap-5">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-clay/10 text-clay">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-taupe">Total Orders</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-espresso">{totalOrders}</p>
            </div>
          </div>

          <div className="rounded-xl border border-divider bg-linen/35 p-6 flex items-center gap-5">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-sage/15 text-sage">
              <IndianRupee size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-taupe">Total Revenue</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-espresso">{formatINR(totalRevenue)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-divider bg-linen/35 p-6 flex items-center gap-5">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-espresso/5 text-espresso">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-taupe">Customers</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-espresso">{totalRegisteredUsers}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-divider">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 px-6 text-sm font-medium transition-all focus:outline-none ${
              activeTab === "orders"
                ? "border-b-2 border-clay text-clay"
                : "text-taupe hover:text-espresso"
            }`}
          >
            Orders ({totalOrders})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-4 px-6 text-sm font-medium transition-all focus:outline-none ${
              activeTab === "users"
                ? "border-b-2 border-clay text-clay"
                : "text-taupe hover:text-espresso"
            }`}
          >
            Users ({totalRegisteredUsers})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "orders" ? (
          <div className="overflow-x-auto rounded-xl border border-divider bg-linen/10">
            <table className="w-full border-collapse text-left text-sm text-espresso">
              <thead className="bg-linen/40 text-xs uppercase tracking-wider text-taupe border-b border-divider">
                <tr>
                  <th className="px-6 py-4">Order Ref</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider bg-white/20">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-taupe italic">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-linen/25 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-clay">{o.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{o.name}</div>
                        <div className="text-xs text-taupe">{o.email}</div>
                      </td>
                      <td className="px-6 py-4">{o.itemCount}</td>
                      <td className="px-6 py-4 uppercase text-xs">{o.payMethod}</td>
                      <td className="px-6 py-4 text-xs text-taupe">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }) : "—"}
                      </td>
                      <td className="px-6 py-4 font-serif font-semibold">{formatINR(o.total)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-full bg-sage/15 px-2.5 py-1 text-xs font-medium text-sage capitalize">
                          {o.status || "processing"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to="/order/$id"
                          params={{ id: o.orderNumber }}
                          className="inline-flex items-center text-clay hover:text-espresso"
                        >
                          Details <ChevronRight size={14} className="ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-divider bg-linen/10">
            <table className="w-full border-collapse text-left text-sm text-espresso">
              <thead className="bg-linen/40 text-xs uppercase tracking-wider text-taupe border-b border-divider">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider bg-white/20">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-linen/25 transition-colors">
                    <td className="px-6 py-4 font-medium">{u.fullName}</td>
                    <td className="px-6 py-4 font-mono text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-clay/10 text-clay"
                            : "bg-espresso/5 text-espresso/80"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-taupe">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
}
