import HomeClient from "@/components/home/HomeClient";

export const revalidate = 300; // 5 minutes — match the live data refresh cadence.

/**
 * Home (/). Round 4 D2 dashboard. The actual data + composition is client-side
 * via useVeqtData / useRegions / computeSeverity — this page is a thin wrapper.
 *
 * The Reddit pre-fetch that used to live here is gone — Letters moved to
 * /community as part of the Round 4 retirement of the multi-column "Letters"
 * treatment on the home page.
 */
export default function Home() {
  return <HomeClient />;
}
