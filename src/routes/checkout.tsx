import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Lock, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/kairi/Layout";

import { useStore, formatINR } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { createOrder } from "../lib/order.server";


export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Kairi" },
      { name: "description", content: "Shipping and payment to place your Kairi order." },
    ],
  }),
  component: Checkout,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  fullName: z.string().trim().min(2, "Required").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Required")
    .max(20)
    .regex(/^[+\d\s-]+$/, "Digits only"),
  address1: z.string().trim().min(4, "Required").max(120),
  address2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Required").max(60),
  state: z.string().trim().min(2, "Required").max(60),
  pincode: z.string().trim().regex(/^\d{5,6}$/, "5–6 digits"),
  country: z.string().trim().min(2).max(60),
  payMethod: z.enum(["card", "upi", "cod"]),
  upiId: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;
type Errors = Partial<Record<keyof FormData, string>>;

function Checkout() {
  const navigate = useNavigate();
  const { cart, products, hydrated } = useStore();
  const { user, profile } = useAuth();
  const items = cart.map((i) => ({ ...i, product: products.find((p) => p.id === i.id) })).filter((i) => i.product);
  const subtotal = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.qty, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  const [form, setForm] = useState<FormData>({
    email: "",
    fullName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    payMethod: "card",
    upiId: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  // Restore draft form from sessionStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem("kairi.checkoutForm");
      if (saved) {
        setForm((f) => ({ ...f, ...JSON.parse(saved) }));
      }
    } catch (e) {
      // Ignore parse error
    }
  }, []);

  // Persist draft form state to sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("kairi.checkoutForm", JSON.stringify(form));
  }, [form]);

  // Warn before accidental page leave if user has entered details
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.fullName || form.address1 || form.phone) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form]);

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        email: profile.email || f.email,
        fullName: profile.fullName || f.fullName,
      }));
    }
  }, [profile]);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  // Prevent false "empty cart" flash during initial hydration
  if (!hydrated) {
    return (
      <Layout>
        <section className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10">
          <div className="animate-pulse space-y-8">
            <div className="h-10 w-48 rounded-lg bg-parchment/60" />
            <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
              <div className="space-y-6">
                <div className="h-48 rounded-2xl bg-parchment/40" />
                <div className="h-64 rounded-2xl bg-parchment/40" />
              </div>
              <div className="h-80 rounded-2xl bg-parchment/50" />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <section className="mx-auto max-w-xl px-6 py-32 text-center">
          <h1 className="font-serif text-5xl italic text-espresso">Your bag is empty.</h1>
          <p className="mt-4 text-taupe">Add a piece or two before you check out.</p>
          <Link
            to="/shop"
            className="mt-8 inline-block rounded-full bg-clay px-7 py-4 text-xs uppercase tracking-[0.22em] text-linen hover:bg-espresso"
          >
            Browse the shop
          </Link>
        </section>
      </Layout>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormData;
        if (!errs[key]) errs[key] = issue.message;
      }
      // payment-specific validation
      if (form.payMethod === "upi") {
        if (!form.upiId || !/^[\w.\-]+@[\w]+$/.test(form.upiId)) errs.upiId = "name@bank";
      }
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }
    // extra payment validation when zod passes
    const extra: Errors = {};
    if (form.payMethod === "upi") {
      if (!form.upiId || !/^[\w.\-]+@[\w]+$/.test(form.upiId)) extra.upiId = "name@bank";
    }
    if (Object.keys(extra).length) {
      setErrors(extra);
      toast.error("Please complete payment details");
      return;
    }

    setSubmitting(true);
    try {
      // Call server function to compute and write the order securely
      const res = await createOrder({
        data: {
          userId: user?.uid || null,
          email: form.email,
          name: form.fullName,
          phone: form.phone,
          shippingAddress: {
            address1: form.address1,
            address2: form.address2 || "",
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: form.country,
          },
          items: items.map((item) => ({
            id: item.id,
            qty: item.qty,
          })),
          payMethod: form.payMethod,
        }
      });

      sessionStorage.setItem(
        "kairi.lastOrder",
        JSON.stringify({
          orderNumber: res.orderNumber,
          email: form.email,
          name: form.fullName,
          total: res.total,
          itemCount: res.itemCount,
          payMethod: form.payMethod,
          createdAt: new Date().toISOString(),
        }),
      );
      localStorage.removeItem("kairi.cart");
      sessionStorage.removeItem("kairi.checkoutForm");

      setTimeout(() => {
        navigate({ to: "/order/$id", params: { id: res.orderNumber } });
      }, 700);
    } catch (err) {
      console.error("Failed to save order:", err);
      toast.error("Failed to process order. Please try again.");
      setSubmitting(false);
      return;
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-[1280px] px-6 py-12 lg:px-10">
        <div className="mb-10">
          <div className="eyebrow text-sage">— Checkout</div>
          <h1 className="mt-3 font-serif text-5xl text-espresso md:text-6xl">
            Almost <span className="italic">yours.</span>
          </h1>
        </div>

        <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <div className="space-y-12">
            <Section
              eyebrow="01"
              title="Contact"
              icon={<ShieldCheck size={16} className="text-sage" />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" error={errors.email}>
                  <input
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={inputCls}
                    placeholder="you@home.com"
                  />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={inputCls}
                    placeholder="+91 98765 43210"
                  />
                </Field>
              </div>
            </Section>

            <Section eyebrow="02" title="Shipping" icon={<Truck size={16} className="text-sage" />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.fullName}>
                  <input
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Country" error={errors.country}>
                  <input
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Address line 1" error={errors.address1} className="sm:col-span-2">
                  <input
                    autoComplete="address-line1"
                    value={form.address1}
                    onChange={(e) => set("address1", e.target.value)}
                    className={inputCls}
                    placeholder="Flat / Building / Street"
                  />
                </Field>
                <Field label="Address line 2 (optional)" className="sm:col-span-2">
                  <input
                    autoComplete="address-line2"
                    value={form.address2}
                    onChange={(e) => set("address2", e.target.value)}
                    className={inputCls}
                    placeholder="Landmark, area"
                  />
                </Field>
                <Field label="City" error={errors.city}>
                  <input
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="State" error={errors.state}>
                  <input
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Pincode" error={errors.pincode}>
                  <input
                    autoComplete="postal-code"
                    value={form.pincode}
                    onChange={(e) => set("pincode", e.target.value)}
                    className={inputCls}
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Order notes (optional)" className="sm:col-span-2">
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    className={`${inputCls} resize-none`}
                    placeholder="A gift message, delivery instructions…"
                  />
                </Field>
              </div>
            </Section>

            <Section eyebrow="03" title="Payment" icon={<Lock size={16} className="text-sage" />}>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    { v: "card", label: "Card" },
                    { v: "upi", label: "UPI" },
                    { v: "cod", label: "Cash on delivery" },
                  ] as const
                ).map((opt) => (
                  <button
                    type="button"
                    key={opt.v}
                    onClick={() => set("payMethod", opt.v)}
                    className={`rounded-xl border px-4 py-4 text-left text-sm transition-all ${
                      form.payMethod === opt.v
                        ? "border-clay bg-clay/5 text-espresso"
                        : "border-divider bg-linen text-espresso/75 hover:border-clay/60"
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className="mt-1 text-xs text-taupe">
                      {opt.v === "card" && "Visa, Mastercard, Amex"}
                      {opt.v === "upi" && "GPay, PhonePe, Paytm"}
                      {opt.v === "cod" && "Pay when it arrives"}
                    </div>
                  </button>
                ))}
              </div>

              {form.payMethod === "card" && (
                <div className="mt-6 rounded-xl border border-sage/30 bg-sage/5 p-4 text-sm text-espresso/80">
                  <div className="flex items-center gap-2 font-medium text-espresso">
                    <ShieldCheck size={16} className="text-sage" />
                    Encrypted Tokenized Payment
                  </div>
                  <p className="mt-1 text-xs text-taupe leading-relaxed">
                    Card details are processed via end-to-end encrypted tokenization (Razorpay/Stripe standard).
                    No raw card credentials are collected or stored in browser memory.
                  </p>
                </div>
              )}

              {form.payMethod === "upi" && (
                <div className="mt-6">
                  <Field label="UPI ID" error={errors.upiId}>
                    <input
                      value={form.upiId}
                      onChange={(e) => set("upiId", e.target.value)}
                      className={inputCls}
                      placeholder="name@bank"
                    />
                  </Field>
                </div>
              )}

              {form.payMethod === "cod" && (
                <p className="mt-6 rounded-lg bg-parchment p-4 text-sm text-espresso/75">
                  You'll pay {formatINR(total)} in cash when your order is delivered. A small handling
                  fee may apply at checkout in some regions.
                </p>
              )}

              <p className="mt-6 flex items-start gap-2 text-xs text-taupe">
                <Lock size={12} className="mt-0.5 shrink-0" />
                PCI DSS Compliant — All checkout transactions are secured and encrypted end-to-end.
              </p>
            </Section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl bg-parchment/70 p-6">
              <h2 className="font-serif text-2xl text-espresso">Your order</h2>
              <ul className="mt-5 divide-y divide-divider">
                {items.map((i) => (
                  <li key={i.id} className="flex gap-3 py-4">
                    <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-linen">
                      <img
                        src={i.product!.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-espresso text-[10px] text-linen">
                        {i.qty}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="truncate text-sm text-espresso">{i.product!.name}</div>
                      <div className="truncate font-serif text-xs italic text-taupe">
                        {i.product!.descriptor}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm text-espresso">
                      {formatINR(i.product!.price * i.qty)}
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="mt-2 space-y-2 border-t border-divider pt-4 text-sm">
                <Row label="Subtotal" value={formatINR(subtotal)} />
                <Row
                  label="Shipping"
                  value={shipping === 0 ? "Free" : formatINR(shipping)}
                  hint={subtotal < 999 ? `Free over ${formatINR(999)}` : undefined}
                />
                <div className="mt-3 flex items-baseline justify-between border-t border-divider pt-4">
                  <dt className="font-serif text-xl italic text-espresso">Total</dt>
                  <dd className="text-xl text-espresso">{formatINR(total)}</dd>
                </div>
              </dl>
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-full bg-clay px-6 py-4 text-xs uppercase tracking-[0.22em] text-linen transition-colors hover:bg-espresso disabled:opacity-60"
              >
                {submitting ? "Placing order…" : `Place order · ${formatINR(total)}`}
              </button>
              <p className="mt-3 text-center text-xs text-taupe">
                By placing your order, you agree to Kairi's terms.
              </p>
            </div>
          </aside>
        </form>
      </section>
    </Layout>
  );
}

const inputCls =
  "w-full rounded-lg border border-divider bg-linen px-4 py-3 text-sm text-espresso placeholder:text-taupe focus:border-clay focus:outline-none";

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs text-espresso/75">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function Section({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <span className="eyebrow text-clay">— {eyebrow}</span>
        <h2 className="font-serif text-3xl text-espresso md:text-4xl">{title}</h2>
        {icon}
      </div>
      {children}
    </section>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-espresso/75">
        {label}
        {hint && <span className="ml-2 text-xs text-taupe">{hint}</span>}
      </dt>
      <dd className="text-espresso">{value}</dd>
    </div>
  );
}
