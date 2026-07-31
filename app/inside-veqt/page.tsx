import type { Metadata } from "next";
import InsideClient from "@/components/inside/InsideClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbSchema,
  buildInvestmentFundSchema,
  canonicalUrl,
} from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Inside VEQT — Holdings & Geographic Allocation",
  description:
    "What's inside VEQT? Explore the 4 underlying ETFs, top 10 holdings with sector tags, and the geographic allocation of Vanguard's all-equity ETF.",
  alternates: { canonical: canonicalUrl("/inside-veqt") },
  openGraph: {
    title: "Inside VEQT — Holdings & Geographic Allocation",
    description:
      "Full breakdown of what VEQT holds: underlying ETFs, top stocks, and country allocation.",
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
      {/* InvestmentFund schema lives here (and on the home page) because this
          page directly describes the fund's structure. Previously mounted
          site-wide via the root layout, which Google treats as decorative. */}
      <JsonLd data={buildInvestmentFundSchema()} />
      <InsideClient />
    </>
  );
}
