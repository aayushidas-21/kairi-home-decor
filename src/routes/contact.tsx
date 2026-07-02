import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/kairi/Layout";
import { Mail, Clock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Kairi" },
      { name: "description", content: "Get in touch with Kairi Home Decor. Email us at hello@kairi.in or send us a message." },
      { property: "og:title", content: "Contact Us — Kairi" },
      { property: "og:description", content: "Say hello. We'd love to hear from you." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSending(true);
    // Simulate API call for form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSending(false);
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you shortly.");
    
    // Clear form
    setFullName("");
    setEmail("");
    setMessage("");
  };

  return (
    <Layout>
      {/* Header Section */}
      <section className="border-b border-divider bg-parchment/40">
        <div className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
          <div className="eyebrow text-sage">— Contact Us</div>
          <h1 className="mt-3 font-serif text-5xl text-espresso md:text-7xl">
            Let&apos;s build <span className="italic">a connection.</span>
          </h1>
          <p className="mt-4 max-w-xl text-espresso/70">
            Have questions about an order, custom pieces, or just want to talk design? We answer every message.
          </p>
        </div>
      </section>

      {/* Main Section: Contact Info + Form */}
      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          
          {/* Left Column: Contact Details Cards */}
          <div className="space-y-8">
            <div>
              <div className="eyebrow text-clay">— Say Hello</div>
              <h2 className="mt-3 font-serif text-3xl text-espresso">Reach out directly</h2>
              <p className="mt-3 text-taupe text-sm leading-relaxed">
                Whether you have an inquiry, feedback, or a partnership idea, our small studio team is ready to respond.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {/* Email Card */}
              <div className="flex items-start gap-4 p-6 rounded-2xl border border-divider bg-linen/25">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-clay/10 text-clay shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-taupe">Email Address</h3>
                  <a href="mailto:hello@kairi.in" className="mt-1.5 block text-espresso font-serif text-lg hover:text-clay transition-colors">
                    hello@kairi.in
                  </a>
                  <p className="mt-1 text-xs text-taupe">We usually reply within 24 hours.</p>
                </div>
              </div>

              {/* Business Hours Card */}
              <div className="flex items-start gap-4 p-6 rounded-2xl border border-divider bg-linen/25">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-espresso/5 text-espresso shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-taupe">Studio Hours</h3>
                  <p className="mt-1.5 text-espresso font-serif text-lg leading-snug">
                    Mon — Sat, 10 AM to 6 PM IST
                  </p>
                  <p className="mt-1 text-xs text-taupe">Excludes national holidays.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="rounded-2xl border border-divider bg-linen/40 p-8 backdrop-blur-sm">
            <h2 className="font-serif text-3xl text-espresso mb-2">Send a Message</h2>
            <p className="text-xs text-taupe mb-8">All fields are required unless marked optional.</p>

            {submitted ? (
              <div className="text-center py-16 space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage/20 text-sage mb-2">
                  <Mail size={24} />
                </div>
                <h3 className="font-serif text-2xl text-espresso">Thank you!</h3>
                <p className="text-sm text-taupe max-w-sm mx-auto">
                  Your message has been received. Our team will get back to you at <strong className="text-espresso font-normal">{email}</strong> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-xs uppercase tracking-wider text-clay border-b border-clay pb-0.5 hover:text-espresso hover:border-espresso transition-all"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-espresso/70">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Aayushi Das"
                      className="w-full rounded-lg border border-divider bg-linen px-4 py-3 text-sm text-espresso placeholder-taupe/65 outline-none transition-all focus:border-clay focus:ring-1 focus:ring-clay"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-espresso/70">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@home.com"
                      className="w-full rounded-lg border border-divider bg-linen px-4 py-3 text-sm text-espresso placeholder-taupe/65 outline-none transition-all focus:border-clay focus:ring-1 focus:ring-clay"
                    />
                  </div>
                </div>

                {/* Subject Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-espresso/70">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-lg border border-divider bg-linen px-4 py-3 text-sm text-espresso outline-none transition-all focus:border-clay focus:ring-1 focus:ring-clay cursor-pointer"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order Questions">Order Questions</option>
                    <option value="Custom Orders">Custom Orders</option>
                    <option value="Design Partnership">Collaborations</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-espresso/70">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you're thinking..."
                    className="w-full rounded-lg border border-divider bg-linen px-4 py-3 text-sm text-espresso placeholder-taupe/65 outline-none transition-all focus:border-clay focus:ring-1 focus:ring-clay resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-full bg-clay py-4 text-xs uppercase tracking-[0.2em] font-medium text-linen transition-all hover:bg-espresso flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>
    </Layout>
  );
}
