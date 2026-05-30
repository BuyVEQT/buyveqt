import type { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildFaqSchema,
  buildInvestmentFundSchema,
  canonicalUrl,
} from "@/lib/seo-config";

export const revalidate = 300; // 5 minutes — match the live data refresh cadence.

// Page-level metadata. The root layout default would cover this, but an
// explicit canonical on `/` keeps it unambiguous for crawlers (no
// query-string variants, no trailing-slash drift).
export const metadata: Metadata = {
  title: {
    absolute: "BuyVEQT — Live VEQT.TO Price, Charts & Analysis",
  },
  description:
    "Live VEQT.TO price, interactive charts, regional sleeves, and fund comparisons — the community hub for Canadian passive investors.",
  alternates: { canonical: canonicalUrl("/") },
  openGraph: {
    title: "BuyVEQT — Live VEQT.TO Price, Charts & Analysis",
    description:
      "One ETF. The whole world. Live data, fund comparisons, and editorial coverage for Canadian VEQT investors.",
    url: canonicalUrl("/"),
  },
};

/**
 * Home (/). Round 4 D2 dashboard. The actual data + composition is client-side
 * via useVeqtData / useRegions / computeSeverity — this page is a thin wrapper.
 *
 * The Reddit pre-fetch that used to live here is gone — Letters moved to
 * /community as part of the Round 4 retirement of the multi-column "Letters"
 * treatment on the home page.
 */
export default function Home() {
  return (
    <>
      {/* FAQPage + InvestmentFund schemas were previously mounted in the root
          layout and shipped on every route — including ones unrelated to the
          fund itself (community, learn/[slug], weekly). Google's structured-
          data guidance prefers page-specific schemas. The two blocks now live
          here (and on /inside-veqt) where they actually describe the page. */}
      <JsonLd data={buildFaqSchema()} />
      <JsonLd data={buildInvestmentFundSchema()} />
      <HomeClient />
    </>
  );
}
