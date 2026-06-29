import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { SearchModal } from "./SearchModal";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-linen text-espresso">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <SearchModal />
    </div>
  );
}
