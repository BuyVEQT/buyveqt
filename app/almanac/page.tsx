import type { Metadata } from "next";
import AlmanacClient from "@/components/almanac/AlmanacClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "The Almanac — VEQT's loudest days on file",
  description:
    "Every VEQT session since 2019 that broke the 90th percentile, newest first: rallies, gales, surges and squalls, with the move, the percentile, and what the tape did next.",
  alternates: { canonical: canonicalUrl("/almanac") },
  openGraph: {
    title: "The Almanac — VEQT's loudest days on file",
    description:
      "The archive of notable VEQT sessions — every day the sky turned, classified by the weather system.",
    url: canonicalUrl("/almanac"),
  },
};

/**
 * /almanac — the archive of editions.
 *
 * Thin wrapper, same shape as /inside-veqt: metadata + breadcrumb schema,
 * with the whole page composed client-side because every row is derived
 * from the ALL history the browser already fetches (see
 * components/almanac/almanac-derive.ts).
 *
 * This is where the home page's rally rail points ("ARCHIVED →").
 * Future /almanac/[date] permalinks can redirect to /almanac#{date} —
 * every row already carries its session date as an id.
 */
export default function AlmanacPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "The Almanac", path: "/almanac" },
        ])}
      />
      <AlmanacClient />
    </>
  );
}
