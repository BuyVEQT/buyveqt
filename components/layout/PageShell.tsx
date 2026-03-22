"use client";

import { useVeqtData } from "@/lib/useVeqtData";
import NavBar from "./NavBar";
import Footer from "./Footer";

export default function PageShell({ children }: { children: React.ReactNode }) {
  const { data, loading } = useVeqtData();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar
        quote={data?.quote ?? null}
        loading={loading}
        isFallback={data?.isFallback ?? false}
      />
      {children}
      <Footer />
    </div>
  );
}
