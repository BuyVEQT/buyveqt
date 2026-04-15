import { getAllWeeklyRecaps } from "@/lib/weekly";
import { buildRssFeed } from "@/lib/rss";

// Rebuild the feed at most once per hour — weekly recaps publish on
// Sundays so anything finer is wasted.
export const revalidate = 3600;

export async function GET() {
  const recaps = getAllWeeklyRecaps();
  const xml = buildRssFeed(recaps);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
