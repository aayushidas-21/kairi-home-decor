import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-divider bg-parchment/60">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 md:grid-cols-4 lg:px-10">
        <div>
          <div className="font-serif text-3xl text-espresso">Kairi</div>
          <p className="mt-3 max-w-xs font-serif text-lg italic text-taupe">
            Intentional spaces. Everyday beauty.
          </p>
        </div>

        <FooterCol
          title="Shop"
          items={[
            { label: "All Products", to: "/shop" },
            { label: "New Arrivals", to: "/shop" },
            { label: "Bestsellers", to: "/shop" },
            { label: "Collections", to: "/collections" },
          ]}
        />
        <FooterCol
          title="Help"
          items={[
            { label: "Shipping", to: "/about" },
            { label: "Returns", to: "/about" },
            { label: "FAQ", to: "/about" },
            { label: "Contact Us", to: "/contact" },
          ]}
        />
        <div>
          <h4 className="eyebrow text-taupe">Follow</h4>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="grid h-10 w-10 place-items-center rounded-full border border-divider text-espresso/80 transition-colors hover:bg-clay hover:text-linen"
            >
              <Instagram size={16} strokeWidth={1.6} />
            </a>
            <a
              href="https://pinterest.com"
              aria-label="Pinterest"
              className="grid h-10 w-10 place-items-center rounded-full border border-divider text-espresso/80 transition-colors hover:bg-clay hover:text-linen"
            >
              <span className="font-serif text-sm">P</span>
            </a>
          </div>
          <p className="mt-6 text-xs text-espresso/65">Made with love in India.</p>
        </div>
      </div>
      <div className="border-t border-divider">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-2 px-6 py-5 text-xs text-espresso/65 md:flex-row md:items-center lg:px-10">
          <span>© {new Date().getFullYear()} Kairi. All rights reserved.</span>
          <span>Privacy · Terms · Cookies</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="eyebrow text-taupe">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {items.map((it) => (
          <li key={it.label}>
            <Link to={it.to} className="text-sm text-espresso/80 transition-colors hover:text-clay">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
