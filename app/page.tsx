import type { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildVeqtPayload, buildRegionsPayload } from "@/lib/data/payloads";
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
 * Home (/). The page server-renders its initial data at ISR time (every
 * 5 minutes, matching /api/veqt) so the first HTML carries the real price,
 * weather and sleeves — the client stores then refetch fresh data in the
 * background. This is the CLS fix: no skeleton→content reflow on load.
 * A failed build-time fetch degrades to null = the old skeleton behavior.
 *
 * The Reddit pre-fetch that used to live here is gone — Letters moved to
 * /community as part of the Round 4 retirement of the multi-column "Letters"
 * treatment on the home page.
 */
export default async function Home() {
  const [veqtResult, regionsResult] = await Promise.allSettled([
    buildVeqtPayload("ALL"),
    buildRegionsPayload(),
  ]);
  const initialData =
    veqtResult.status === "fulfilled" ? veqtResult.value : null;
  const initialRegions =
    regionsResult.status === "fulfilled" ? regionsResult.value : null;

  return (
    <>
      {/* FAQPage + InvestmentFund schemas were previously mounted in the root
          layout and shipped on every route — including ones unrelated to the
          fund itself (community, learn/[slug], weekly). Google's structured-
          data guidance prefers page-specific schemas. The two blocks now live
          here (and on /inside-veqt) where they actually describe the page. */}
      <JsonLd data={buildFaqSchema()} />
      <JsonLd data={buildInvestmentFundSchema()} />
      <HomeClient initialData={initialData} initialRegions={initialRegions} />
    </>
  );
}
