import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, setDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ShieldAlert, ShoppingBag, Users, IndianRupee, ChevronRight, LogOut, Plus, Upload, Tag, FileText, Settings } from "lucide-react";
import { Layout } from "@/components/kairi/Layout";
import { useAuth } from "@/lib/auth";
import { db, storage } from "@/lib/firebase";
import { useStore, formatINR } from "@/lib/store";
import { toast } from "sonner";

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
  const { products } = useStore();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "users">("orders");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State for Adding Product
  const [prodId, setProdId] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("Vases & Ceramics");
  const [prodStory, setProdStory] = useState("");
  const [prodCare, setProdCare] = useState("");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [bestseller, setBestseller] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

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

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadSnap = await uploadBytes(imageRef, file);
      const url = await getDownloadURL(uploadSnap.ref);
      setProdImageUrl(url);
      toast.success("Product image uploaded successfully ✦");
    } catch (err) {
      console.error("Failed to upload image:", err);
      toast.error("Failed to upload product image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Add Product Submit Handler
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodId.trim() || !prodName.trim() || !prodPrice || !prodImageUrl) {
      toast.error("Please fill in all required fields (ID, Name, Price, Image)");
      return;
    }

    setSavingProduct(true);
    const cleanedId = prodId.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

    try {
      await setDoc(doc(db, "products", cleanedId), {
        id: cleanedId,
        name: prodName.trim(),
        descriptor: prodDesc.trim(),
        price: Number(prodPrice),
        image: prodImageUrl,
        category: prodCategory,
        story: prodStory.trim(),
        care: prodCare.trim(),
        isNew,
        bestseller,
      });

      toast.success("New product added successfully ✦");
      
      // Reset form
      setProdId("");
      setProdName("");
      setProdDesc("");
      setProdPrice("");
      setProdStory("");
      setProdCare("");
      setProdImageUrl("");
      setShowAddForm(false);
      
      // Refresh database reference lists by reloading page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Failed to add product:", err);
      toast.error("Failed to add product. Please verify Firestore rules.");
    } finally {
      setSavingProduct(false);
    }
  };

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
        <div className="mb-6 flex border-b border-divider flex-wrap">
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
            onClick={() => setActiveTab("products")}
            className={`pb-4 px-6 text-sm font-medium transition-all focus:outline-none ${
              activeTab === "products"
                ? "border-b-2 border-clay text-clay"
                : "text-taupe hover:text-espresso"
            }`}
          >
            Products ({products.length})
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
        {activeTab === "orders" && (
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
        )}

        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl text-espresso">Product Catalog</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 rounded-full bg-clay px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-linen hover:bg-espresso focus:outline-none transition-all shadow-warm-sm"
              >
                <Plus size={14} /> {showAddForm ? "Cancel Form" : "Add Product"}
              </button>
            </div>

            {/* Add Product Form */}
            {showAddForm && (
              <form 
                onSubmit={handleAddProduct}
                className="rounded-2xl border border-divider bg-parchment/40 p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-300 grid gap-6 md:grid-cols-2"
              >
                <div className="col-span-2 border-b border-divider pb-3">
                  <h4 className="font-serif text-lg text-espresso italic">✦ Create New Product</h4>
                </div>

                {/* Left Form Column */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wider text-taupe">Product ID / Slug (Unique, URL safe) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. minimalist-wooden-chair"
                      value={prodId}
                      onChange={(e) => setProdId(e.target.value)}
                      className="w-full rounded-lg border border-divider bg-linen px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wider text-taupe">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Oak Minimalist Chair"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full rounded-lg border border-divider bg-linen px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wider text-taupe">Descriptor / Short Tagline</label>
                    <input
                      type="text"
                      placeholder="e.g. Organic oiled solid white oak"
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      className="w-full rounded-lg border border-divider bg-linen px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wider text-taupe">Price (INR) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 2490"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        className="w-full rounded-lg border border-divider bg-linen px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wider text-taupe">Category *</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full rounded-lg border border-divider bg-linen px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay h-[42px]"
                      >
                        <option value="Vases & Ceramics">Vases & Ceramics</option>
                        <option value="Cushions & Throws">Cushions & Throws</option>
                        <option value="Wall Decor">Wall Decor</option>
                        <option value="Candles & Scents">Candles & Scents</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Flags */}
                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-taupe cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isNew}
                        onChange={(e) => setIsNew(e.target.checked)}
                        className="rounded border-divider text-clay focus:ring-clay"
                      />
                      Mark as New Drop
                    </label>

                    <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-taupe cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={bestseller}
                        onChange={(e) => setBestseller(e.target.checked)}
                        className="rounded border-divider text-clay focus:ring-clay"
                      />
                      Mark as Bestseller
                    </label>
                  </div>
                </div>

                {/* Right Form Column */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wider text-taupe">Product Story / Description</label>
                    <textarea
                      rows={3}
                      placeholder="Describe the craft, material, and wabi-sabi philosophy of the product..."
                      value={prodStory}
                      onChange={(e) => setProdStory(e.target.value)}
                      className="w-full rounded-lg border border-divider bg-linen px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay resize-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wider text-taupe">Care & Handling Details</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Wipe with a dry microfiber cloth..."
                      value={prodCare}
                      onChange={(e) => setProdCare(e.target.value)}
                      className="w-full rounded-lg border border-divider bg-linen px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay resize-none"
                    />
                  </div>

                  {/* Image Selector & Uploader */}
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wider text-taupe">Product Image *</label>
                    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-divider p-4 bg-linen/50">
                      <div className="flex items-center gap-4">
                        {prodImageUrl ? (
                          <img 
                            src={prodImageUrl} 
                            alt="Preview" 
                            className="h-16 w-14 rounded-md object-cover border border-divider bg-parchment"
                          />
                        ) : (
                          <div className="grid h-16 w-14 place-items-center rounded-md border border-divider bg-linen text-taupe">
                            <Tag size={18} />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <label className="inline-flex items-center gap-1.5 rounded-full bg-espresso px-4 py-2 text-xs font-medium text-linen hover:bg-clay cursor-pointer transition-all">
                            <Upload size={12} /> {uploadingImage ? "Uploading..." : "Upload Image"}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              className="hidden"
                            />
                          </label>
                          <p className="mt-1 text-[10px] text-taupe truncate">Or paste image URL below</p>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Paste image URL direct reference..."
                        value={prodImageUrl}
                        onChange={(e) => setProdImageUrl(e.target.value)}
                        className="w-full rounded-lg border border-divider bg-linen px-3 py-1.5 text-xs text-espresso outline-none focus:border-clay"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="col-span-2 border-t border-divider pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-full border border-divider px-6 py-3 text-xs uppercase tracking-wider text-espresso hover:bg-linen"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct || uploadingImage}
                    className="rounded-full bg-clay px-8 py-3 text-xs uppercase tracking-wider font-semibold text-linen hover:bg-espresso disabled:opacity-50"
                  >
                    {savingProduct ? "Saving Product..." : "Save Product"}
                  </button>
                </div>
              </form>
            )}

            {/* Products List Table */}
            <div className="overflow-x-auto rounded-xl border border-divider bg-linen/10">
              <table className="w-full border-collapse text-left text-sm text-espresso">
                <thead className="bg-linen/40 text-xs uppercase tracking-wider text-taupe border-b border-divider">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Product ID</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider bg-white/20">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-taupe italic">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-linen/25 transition-colors">
                        <td className="px-6 py-4">
                          <img 
                            src={p.image} 
                            alt="" 
                            className="h-12 w-10 rounded object-cover border border-divider"
                          />
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-taupe">{p.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-taupe truncate max-w-xs">{p.descriptor}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-espresso/70">{p.category}</td>
                        <td className="px-6 py-4 font-serif font-semibold">{formatINR(p.price)}</td>
                        <td className="px-6 py-4 space-x-1.5">
                          {p.isNew && (
                            <span className="inline-block rounded-full bg-sage/15 px-2 py-0.5 text-[10px] font-medium text-sage uppercase">
                              New
                            </span>
                          )}
                          {p.bestseller && (
                            <span className="inline-block rounded-full bg-clay/10 px-2 py-0.5 text-[10px] font-medium text-clay uppercase">
                              Best
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
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
