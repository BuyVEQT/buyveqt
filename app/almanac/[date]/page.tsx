import type { Metadata } from "next";
import { redirect } from "next/navigation";

/**
 * /almanac/YYYY-MM-DD — session permalinks.
 *
 * A pure redirect, no data fetching. Every row on /almanac already carries
 * its session date as an `id`, and AlmanacClient already runs a deferred
 * jump once the ALL history lands (the rows don't exist at the moment the
 * browser would normally honour a hash), so the whole job here is to hand
 * the date to that machinery as a fragment.
 *
 * Anything that isn't a YYYY-MM-DD shape goes to the bare archive rather
 * than 404ing — a mistyped permalink should still land the reader on the
 * page they were promised.
 */

const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `The Almanac — ${DATE_SHAPE.test(date) ? date : "session archive"}`,
    description:
      "A single session in The Almanac — VEQT's archive of days that broke the 90th percentile.",
    // This route only ever redirects; the archive page itself is the
    // canonical, indexable surface.
    robots: { index: false, follow: true },
  };
}

export default async function AlmanacDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  redirect(DATE_SHAPE.test(date) ? `/almanac#${date}` : "/almanac");
}
