import HomeClient from "@/components/home/HomeClient";
import { getLatestWeeklyRecap } from "@/lib/weekly";
import { VEQT_DISTRIBUTIONS } from "@/data/distributions";

/**
 * Home page is now a Server Component. Server-only reads (filesystem MDX for
 * weekly recaps, static distributions data) happen here; the interactive tree
 * (chart, live quote polling) lives inside HomeClient.
 *
 * ISR matches the underlying /api/veqt route so the server-rendered shell
 * refreshes in sync with the chart data.
 */
export const revalidate = 300;

export default async function Home() {
  const latestRecap = getLatestWeeklyRecap();
  // Surface only confirmed distributions; skip Vanguard's forward-looking estimate.
  const latestDistribution =
    VEQT_DISTRIBUTIONS.distributions.find((d) => !d.estimated) ?? null;

  return (
    <HomeClient
      latestRecap={latestRecap}
      latestDistribution={latestDistribution}
    />
  );
}
