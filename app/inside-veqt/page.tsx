import type { Metadata } from "next";
import InsideClient from "@/components/inside/InsideClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Inside VEQT — Holdings, Sectors & Geographic Allocation",
  description:
    "What's inside VEQT? Explore the 4 underlying ETFs, top 10 holdings, sector breakdown, and geographic allocation of Vanguard's all-equity ETF.",
  alternates: { canonical: canonicalUrl("/inside-veqt") },
  openGraph: {
    title: "Inside VEQT — Holdings, Sectors & Geographic Allocation",
    description:
      "Full breakdown of what VEQT holds: underlying ETFs, top stocks, sectors, and country allocation.",
    url: canonicalUrl("/inside-veqt"),
  },
};

export default function InsideVeqtPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Inside VEQT", path: "/inside-veqt" },
        ])}
      />
      <InsideClient />
    </>
  );
}
