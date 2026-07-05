import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, setDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  ShieldAlert, ShoppingBag, Users, IndianRupee, ChevronRight, LogOut, 
  Plus, Upload, Tag, Edit, BarChart3, Package, Layers, Settings, Eye,
  Menu, X, AlertTriangle, HelpCircle, ArrowUpRight
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
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

// 3D Tilt KPI Card Component
function KPI3DCard({ 
  title, 
  value, 
  subtext,
  icon: Icon, 
  bgIcon: BgIcon, 
  iconColorClass 
}: { 
  title: string; 
  value: string | number; 
  subtext?: string;
  icon: any; 
  bgIcon: any; 
  iconColorClass: string; 
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
    const rotateX = ((centerY - y) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform: hovered 
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px)` 
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)",
        transition: hovered ? "transform 0.05s ease-out, shadow 0.3s" : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), shadow 0.3s"
      }}
      className="relative overflow-hidden rounded-2xl border border-divider bg-white/45 backdrop-blur-md p-6 flex items-center gap-5 shadow-warm-sm transition-all duration-300 hover:shadow-warm-md cursor-default group"
    >
      <div className={`grid h-12 w-12 place-items-center rounded-full transition-all duration-300 ${iconColorClass}`}>
        <Icon size={20} />
      </div>
      <div className="z-10">
        <p className="text-xs uppercase tracking-wider text-taupe font-medium">{title}</p>
        <p className="mt-1 font-serif text-3xl font-semibold text-espresso">{value}</p>
        {subtext && <p className="text-[10px] text-taupe/90 mt-1">{subtext}</p>}
      </div>
      <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-espresso pointer-events-none group-hover:scale-110 transition-transform duration-500">
        <BgIcon size={120} />
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { user: authUser, role, loading, logout } = useAuth();
  const { products } = useStore();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeNav, setActiveNav] = useState<"dashboard" | "products" | "orders">("dashboard");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form State for Adding/Editing Product
  const [prodId, setProdId] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCategory, setProdCategory] = useState("Vases & Ceramics");
  const [prodStory, setProdStory] = useState("");
  const [prodCare, setProdCare] = useState("");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodStock, setProdStock] = useState("50");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [bestseller, setBestseller] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!authUser || role !== "admin") {
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
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setFetching(false);
      }
    }

    fetchData();
  }, [authUser, role, loading]);

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

  // Click Edit Product Handler
  const handleStartEdit = (p: any) => {
    setEditMode(true);
    setProdId(p.id);
    setProdName(p.name);
    setProdDesc(p.descriptor || "");
    setProdPrice(String(p.price));
    setProdCategory(p.category || "Vases & Ceramics");
    setProdStory(p.story || "");
    setProdCare(p.care || "");
    setProdImageUrl(p.image || "");
    setProdStock(String(p.stock !== undefined ? p.stock : 50));
    setIsNew(p.isNew || false);
    setBestseller(p.bestseller || false);
    setShowAddForm(true);
    
    // Scroll to form smoothly
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  // Cancel form
  const handleCancelForm = () => {
    setEditMode(false);
    setProdId("");
    setProdName("");
    setProdDesc("");
    setProdPrice("");
    setProdCategory("Vases & Ceramics");
    setProdStory("");
    setProdCare("");
    setProdImageUrl("");
    setProdStock("50");
    setIsNew(true);
    setBestseller(false);
    setShowAddForm(false);
  };

  // Add/Edit Product Submit Handler
  const handleSaveProduct = async (e: React.FormEvent) => {
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
        stock: Number(prodStock) || 0
      });

      toast.success(editMode ? "Product updated successfully ✦" : "New product added successfully ✦");
      handleCancelForm();
      
      // Refresh list
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Failed to save product:", err);
      toast.error("Failed to save product. Verify database connection.");
    } finally {
      setSavingProduct(false);
    }
  };

  if (loading || (authUser && role === "admin" && fetching)) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center bg-linen/20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-clay border-t-transparent mx-auto"></div>
            <p className="mt-4 font-serif text-lg italic text-taupe">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!authUser || role !== "admin") {
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

  // Calculations for KPIs
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;
  const totalRegisteredUsers = users.length;
  
  // Active catalog products
  const activeCatalogCount = products.length;
  
  // Low stock products count (stock <= 5)
  const lowStockCount = products.filter(p => (p.stock !== undefined ? p.stock : 50) <= 5).length;

  // Average catalog price
  const avgPrice = activeCatalogCount > 0 
    ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / activeCatalogCount) 
    : 0;

  // Inventory Alerts List (stock <= 15)
  const lowStockItemsList = products.filter(p => (p.stock !== undefined ? p.stock : 50) <= 15);

  // Generate Recharts sales data for last 7 days dynamically
  const generateSalesChartData = () => {
    const dataList = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
      
      const dayRevenue = orders
        .filter(o => o.createdAt && o.createdAt.startsWith(key))
        .reduce((sum, o) => sum + (o.total || 0), 0);
        
      dataList.push({
        name: label,
        revenue: dayRevenue
      });
    }
    return dataList;
  };

  const salesChartData = generateSalesChartData();

  return (
    <Layout>
      <div className="grid lg:grid-cols-[260px_1fr] min-h-[80vh] bg-[#fbf9f6] border-t border-divider">
        
        {/* ==================== LEFT SIDEBAR ==================== */}
        <aside className="border-r border-divider bg-[#fbf9f6] flex-col justify-between hidden lg:flex h-[80vh] sticky top-0 p-6">
          <div className="space-y-8">
            {/* Sidebar Title */}
            <div>
              <div className="flex items-center gap-1.5 font-serif text-espresso text-xl font-bold tracking-wide">
                <span>✦ Kairi Studio</span>
              </div>
              <p className="text-[10px] text-taupe/85 uppercase tracking-widest mt-1">Management Portal</p>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1">
              <button
                onClick={() => { setActiveNav("dashboard"); handleCancelForm(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeNav === "dashboard"
                    ? "bg-clay text-linen shadow-warm-sm"
                    : "text-espresso/70 hover:bg-parchment hover:text-espresso"
                }`}
              >
                <BarChart3 size={15} /> Dashboard
              </button>
              <button
                onClick={() => { setActiveNav("products"); handleCancelForm(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeNav === "products"
                    ? "bg-clay text-linen shadow-warm-sm"
                    : "text-espresso/70 hover:bg-parchment hover:text-espresso"
                }`}
              >
                <Package size={15} /> Products
              </button>
              <button
                onClick={() => { setActiveNav("orders"); handleCancelForm(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeNav === "orders"
                    ? "bg-clay text-linen shadow-warm-sm"
                    : "text-espresso/70 hover:bg-parchment hover:text-espresso"
                }`}
              >
                <ShoppingBag size={15} /> Orders
              </button>
            </nav>
          </div>

          {/* Admin Profile & Actions */}
          <div className="border-t border-divider pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-clay/10 border border-clay/20 grid place-items-center text-clay font-serif font-bold text-sm uppercase">
                {authUser?.fullName?.[0] || authUser?.email?.[0] || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-espresso truncate">{authUser?.fullName || "Admin Profile"}</p>
                <p className="text-[10px] text-taupe truncate font-mono">{authUser?.email}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link
                to="/"
                className="flex-1 text-center py-2 rounded-lg border border-divider text-[10px] uppercase font-semibold tracking-wider text-espresso/80 hover:bg-parchment transition-all"
              >
                Storefront
              </Link>
              <button
                onClick={() => logout().then(() => navigate({ to: "/" }))}
                className="p-2 rounded-lg border border-divider text-espresso/75 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all focus:outline-none"
                title="Logout"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Nav Top Header */}
        <div className="lg:hidden border-b border-divider bg-white px-6 py-4 flex items-center justify-between col-span-full">
          <div>
            <span className="font-serif text-espresso text-base font-bold">✦ Kairi Dashboard</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg border border-divider text-espresso/80"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-espresso/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-[#fbf9f6] border-r border-divider p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-serif text-espresso text-lg font-bold">✦ Kairi Studio</span>
                    <p className="text-[9px] text-taupe tracking-wider">Store Management</p>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg border border-divider">
                    <X size={14} />
                  </button>
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => { setActiveNav("dashboard"); setSidebarOpen(false); handleCancelForm(); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                      activeNav === "dashboard" ? "bg-clay text-linen" : "text-espresso/70"
                    }`}
                  >
                    <BarChart3 size={14} /> Dashboard
                  </button>
                  <button
                    onClick={() => { setActiveNav("products"); setSidebarOpen(false); handleCancelForm(); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                      activeNav === "products" ? "bg-clay text-linen" : "text-espresso/70"
                    }`}
                  >
                    <Package size={14} /> Products
                  </button>
                  <button
                    onClick={() => { setActiveNav("orders"); setSidebarOpen(false); handleCancelForm(); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                      activeNav === "orders" ? "bg-clay text-linen" : "text-espresso/70"
                    }`}
                  >
                    <ShoppingBag size={14} /> Orders
                  </button>
                </nav>
              </div>

              <div className="border-t border-divider pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-clay/10 grid place-items-center text-clay font-bold text-xs uppercase font-serif">A</div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-espresso truncate">{authUser?.fullName || "Admin User"}</p>
                    <p className="text-[9px] text-taupe truncate font-mono">{authUser?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to="/" className="flex-1 text-center py-2 rounded-lg border border-divider text-[10px] uppercase font-semibold tracking-wider text-espresso">Storefront</Link>
                  <button onClick={() => logout().then(() => navigate({ to: "/" }))} className="p-2 rounded-lg border border-divider text-espresso"><LogOut size={12} /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== MAIN DASHBOARD WORKSPACE ==================== */}
        <main className="p-6 md:p-8 lg:p-10 overflow-y-auto max-w-full">
          
          {/* Executive Dashboard Tab Content */}
          {activeNav === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Tab Header */}
              <div>
                <h2 className="font-serif text-3xl font-bold text-espresso tracking-tight">Executive Dashboard</h2>
                <p className="text-xs text-taupe mt-1.5 leading-relaxed">Real-time sales tracking, order analysis, and catalog metrics.</p>
              </div>

              {/* Stat Card Grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <KPI3DCard 
                  title="Total Revenue" 
                  value={formatINR(totalRevenue)} 
                  subtext="Exclude cancelled orders"
                  icon={IndianRupee} 
                  bgIcon={IndianRupee} 
                  iconColorClass="bg-clay/10 text-clay group-hover:bg-clay group-hover:text-linen" 
                />
                <KPI3DCard 
                  title="Total Orders" 
                  value={totalOrders} 
                  subtext="Total transactions in checkout"
                  icon={ShoppingBag} 
                  bgIcon={ShoppingBag} 
                  iconColorClass="bg-[#7a8c6e]/10 text-[#7a8c6e] group-hover:bg-[#7a8c6e] group-hover:text-linen" 
                />
                <KPI3DCard 
                  title="Active Catalog" 
                  value={`${activeCatalogCount} / ${activeCatalogCount}`} 
                  subtext="Products active in storefront"
                  icon={Tag} 
                  bgIcon={Tag} 
                  iconColorClass="bg-espresso/5 text-espresso group-hover:bg-espresso group-hover:text-linen" 
                />
                <KPI3DCard 
                  title="Low Stock Items" 
                  value={lowStockCount} 
                  subtext="Items with 5 or less in stock"
                  icon={AlertTriangle} 
                  bgIcon={AlertTriangle} 
                  iconColorClass={lowStockCount > 0 ? "bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-linen" : "bg-sage/10 text-sage group-hover:bg-sage group-hover:text-linen"} 
                />
              </div>

              {/* Lower Section (Graph & Side Metrics) */}
              <div className="grid gap-6 lg:grid-cols-3">
                
                {/* Revenue Overview Graph Panel */}
                <div className="lg:col-span-2 rounded-2xl border border-divider bg-white/70 backdrop-blur-md p-6 shadow-warm-sm flex flex-col justify-between min-h-[350px]">
                  <div>
                    <h3 className="font-serif text-lg text-espresso font-semibold">Revenue Overview</h3>
                    <p className="text-[10px] text-taupe uppercase tracking-wider mt-0.5">Daily sales distribution trend</p>
                  </div>
                  
                  <div className="h-60 w-full mt-6">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={salesChartData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#b5845a" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#b5845a" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0e9e1" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="#8c827a" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            dy={10}
                          />
                          <YAxis 
                            stroke="#8c827a" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(v) => `₹${v}`}
                            dx={-5}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "#f5f0eb", 
                              borderColor: "#b5845a", 
                              borderRadius: "12px",
                              fontFamily: "Outfit, sans-serif",
                              fontSize: "11px",
                              boxShadow: "0 4px 12px rgba(44,36,32,0.08)"
                            }}
                            formatter={(v) => [`₹${v}`, "Revenue"]}
                            labelStyle={{ color: "#2c2420", fontWeight: 600 }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#b5845a" 
                            strokeWidth={2.5} 
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-taupe italic text-xs">
                        Loading charts...
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side Panel - Inventory Alerts & Avg Price */}
                <div className="space-y-6">
                  
                  {/* Inventory Alerts Box */}
                  <div className="rounded-2xl border border-divider bg-white/70 backdrop-blur-md p-6 shadow-warm-sm flex flex-col justify-between h-[180px]">
                    <div>
                      <h3 className="font-serif text-sm font-semibold text-espresso">Inventory Alerts</h3>
                      <p className="text-[10px] text-taupe uppercase tracking-wider mt-0.5">Products running low on stock</p>
                    </div>

                    <div className="mt-4 flex-1 flex flex-col justify-center overflow-y-auto">
                      {lowStockItemsList.length === 0 ? (
                        <p className="text-xs text-taupe/90 italic text-center">All catalog items are well stocked.</p>
                      ) : (
                        <div className="space-y-2 max-h-[85px] overflow-y-auto pr-1">
                          {lowStockItemsList.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-xs">
                              <span className="font-medium text-espresso truncate max-w-[120px]">{item.name}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                (item.stock || 0) <= 5 ? "bg-red-50 border-red-200 text-red-500" : "bg-amber-50 border-amber-200 text-amber-600"
                              }`}>
                                {item.stock || 0} left
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Avg Price Display Box */}
                  <div className="rounded-2xl border border-divider bg-white/70 backdrop-blur-md p-6 shadow-warm-sm flex items-center justify-between h-[110px] group transition-all duration-300 hover:shadow-warm-md">
                    <div>
                      <h3 className="font-serif text-sm font-semibold text-espresso">Average Price</h3>
                      <p className="text-[10px] text-taupe uppercase tracking-wider mt-0.5">Avg price in catalog</p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-3xl font-bold text-clay tracking-tight">{avgPrice}</p>
                      <span className="text-[9px] text-taupe uppercase font-bold tracking-wide">INR</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* Catalog Tab Content */}
          {activeNav === "products" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center bg-linen/20 p-4 rounded-xl border border-divider">
                <div>
                  <h3 className="font-serif text-xl text-espresso font-medium">Product Catalog Management</h3>
                  <p className="text-xs text-taupe mt-1">Manage items, edit information, adjust stocks, or add new drops.</p>
                </div>
                <button
                  onClick={() => {
                    if (showAddForm) handleCancelForm();
                    else setShowAddForm(true);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-clay px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-linen hover:bg-espresso focus:outline-none transition-all shadow-warm-sm"
                >
                  <Plus size={14} /> {showAddForm ? "Cancel Form" : "Add Product"}
                </button>
              </div>

              {/* Add / Edit Product Form */}
              {showAddForm && (
                <form 
                  onSubmit={handleSaveProduct}
                  className="rounded-2xl border border-clay/20 bg-parchment/40 p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-300 grid gap-6 md:grid-cols-2 shadow-warm-md"
                >
                  <div className="col-span-2 border-b border-divider pb-3 flex items-center justify-between">
                    <h4 className="font-serif text-lg text-espresso italic">
                      {editMode ? `✦ Edit Product: ${prodName}` : "✦ Create New Product"}
                    </h4>
                    {editMode && (
                      <span className="rounded bg-clay/15 px-2.5 py-0.5 text-[10px] uppercase font-bold text-clay tracking-wide">
                        Editing
                      </span>
                    )}
                  </div>

                  {/* Left Form Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wider text-taupe font-medium">Product ID / Slug (Unique, URL safe) *</label>
                      <input
                        type="text"
                        required
                        disabled={editMode}
                        placeholder="e.g. minimalist-wooden-chair"
                        value={prodId}
                        onChange={(e) => setProdId(e.target.value)}
                        className="w-full rounded-lg border border-divider bg-linen/50 px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wider text-taupe font-medium">Product Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Oak Minimalist Chair"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="w-full rounded-lg border border-divider bg-linen/50 px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wider text-taupe font-medium">Descriptor / Short Tagline</label>
                      <input
                        type="text"
                        placeholder="e.g. Organic oiled solid white oak"
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        className="w-full rounded-lg border border-divider bg-linen/50 px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-wider text-taupe font-medium">Price (INR) *</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 2490"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          className="w-full rounded-lg border border-divider bg-linen/50 px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-wider text-taupe font-medium">Stock *</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 50"
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                          className="w-full rounded-lg border border-divider bg-linen/50 px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-wider text-taupe font-medium">Category *</label>
                        <select
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value)}
                          className="w-full rounded-lg border border-divider bg-linen/50 px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay h-[42px]"
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
                      <label className="mb-1 block text-xs uppercase tracking-wider text-taupe font-medium">Product Story / Description</label>
                      <textarea
                        rows={3}
                        placeholder="Describe the craft, material, and wabi-sabi philosophy of the product..."
                        value={prodStory}
                        onChange={(e) => setProdStory(e.target.value)}
                        className="w-full rounded-lg border border-divider bg-linen/50 px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay resize-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wider text-taupe font-medium">Care & Handling Details</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Wipe with a dry microfiber cloth..."
                        value={prodCare}
                        onChange={(e) => setProdCare(e.target.value)}
                        className="w-full rounded-lg border border-divider bg-linen/50 px-4 py-2.5 text-sm text-espresso outline-none focus:border-clay resize-none"
                      />
                    </div>

                    {/* Image Selector & Uploader */}
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wider text-taupe font-medium">Product Image *</label>
                      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-divider p-4 bg-linen/30">
                        <div className="flex items-center gap-4">
                          {prodImageUrl ? (
                            <img 
                              src={prodImageUrl} 
                              alt="Preview" 
                              className="h-16 w-14 rounded-md object-cover border border-divider bg-parchment shadow-warm-sm"
                            />
                          ) : (
                            <div className="grid h-16 w-14 place-items-center rounded-md border border-divider bg-linen text-taupe">
                              <Tag size={18} />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <label className="inline-flex items-center gap-1.5 rounded-full bg-espresso px-4 py-2 text-xs font-medium text-linen hover:bg-clay cursor-pointer transition-all shadow-warm-sm">
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
                          className="w-full rounded-lg border border-divider bg-linen/50 px-3 py-1.5 text-xs text-espresso outline-none focus:border-clay"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="col-span-2 border-t border-divider pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="rounded-full border border-divider px-6 py-3 text-xs uppercase tracking-wider text-espresso hover:bg-linen"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProduct || uploadingImage}
                      className="rounded-full bg-clay px-8 py-3 text-xs uppercase tracking-wider font-semibold text-linen hover:bg-espresso disabled:opacity-50 transition-all"
                    >
                      {savingProduct ? "Saving Product..." : editMode ? "Update Product" : "Save Product"}
                    </button>
                  </div>
                </form>
              )}

              {/* Products List Table */}
              <div className="overflow-x-auto rounded-2xl border border-divider bg-white/55 backdrop-blur-sm shadow-warm-sm">
                <table className="w-full border-collapse text-left text-sm text-espresso">
                  <thead className="bg-linen/40 text-xs uppercase tracking-wider text-taupe border-b border-divider font-semibold">
                    <tr>
                      <th className="px-6 py-4">Image</th>
                      <th className="px-6 py-4">Product ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Tags</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-taupe italic">
                          No products found.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => {
                        const stockVal = p.stock !== undefined ? p.stock : 50;
                        return (
                          <tr key={p.id} className="hover:bg-linen/15 transition-all duration-200">
                            <td className="px-6 py-4 overflow-hidden">
                              <img 
                                src={p.image} 
                                alt="" 
                                className="h-14 w-11 rounded-md object-cover border border-divider shadow-warm-sm bg-linen hover:scale-125 hover:rotate-3 transition-transform duration-300 cursor-zoom-in"
                              />
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-taupe">{p.id}</td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-espresso">{p.name}</div>
                              <div className="text-xs text-taupe truncate max-w-xs">{p.descriptor}</div>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-espresso/70">{p.category}</td>
                            <td className="px-6 py-4 font-serif font-semibold text-espresso">{formatINR(p.price)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-warm-sm border ${
                                stockVal <= 5
                                  ? "bg-red-50 text-red-500 border-red-200"
                                  : stockVal <= 15
                                    ? "bg-amber-50 text-amber-600 border-amber-200"
                                    : "bg-sage/10 text-sage border-sage/20"
                              }`}>
                                {stockVal} units
                              </span>
                            </td>
                            <td className="px-6 py-4 space-x-1.5">
                              {p.isNew && (
                                <span className="inline-block rounded-full bg-sage/10 border border-sage/20 px-2 py-0.5 text-[9px] font-bold text-sage uppercase tracking-wider">
                                  New
                                </span>
                              )}
                              {p.bestseller && (
                                <span className="inline-block rounded-full bg-clay/10 border border-clay/20 px-2 py-0.5 text-[9px] font-bold text-clay uppercase tracking-wider">
                                  Best
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleStartEdit(p)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-clay hover:text-espresso transition-all hover:underline"
                              >
                                <Edit size={13} /> Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab Content */}
          {activeNav === "orders" && (
            <div className="overflow-x-auto rounded-2xl border border-divider bg-white/55 backdrop-blur-sm shadow-warm-sm animate-in fade-in duration-300">
              <table className="w-full border-collapse text-left text-sm text-espresso">
                <thead className="bg-linen/40 text-xs uppercase tracking-wider text-taupe border-b border-divider font-semibold">
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
                <tbody className="divide-y divide-divider">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-taupe italic">
                        No orders placed yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-linen/15 transition-all duration-200">
                        <td className="px-6 py-4 font-mono font-medium text-clay">{o.orderNumber}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-espresso">{o.name}</div>
                          <div className="text-xs text-taupe font-mono">{o.email}</div>
                        </td>
                        <td className="px-6 py-4 font-medium">{o.itemCount}</td>
                        <td className="px-6 py-4 uppercase text-xs font-semibold text-espresso/85">{o.payMethod}</td>
                        <td className="px-6 py-4 text-xs text-taupe">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }) : "—"}
                        </td>
                        <td className="px-6 py-4 font-serif font-semibold text-espresso">{formatINR(o.total)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block rounded-full bg-sage/10 border border-sage/20 px-2.5 py-1 text-xs font-semibold text-sage capitalize shadow-warm-sm">
                            {o.status || "processing"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to="/order/$id"
                            params={{ id: o.orderNumber }}
                            className="inline-flex items-center text-clay hover:text-espresso font-semibold hover:underline"
                          >
                            Details <ChevronRight size={14} className="ml-0.5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>
    </Layout>
  );
}
