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
    "What's inside VEQT? 13,726 companies drawn to scale: the four sleeves, top holdings, $100-per-sleeve race since 2019, yields, and the year on tape.",
  alternates: { canonical: canonicalUrl("/inside-veqt") },
  openGraph: {
    title: "Inside VEQT — Holdings & Geographic Allocation",
    description:
      "The Observatory: VEQT's four sleeves to scale, top holdings, the $100 race since launch, and what the machine pays.",
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
