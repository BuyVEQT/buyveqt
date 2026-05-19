import { renderBroadsheetOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/broadsheet";
import { COMPARISON_PAGES } from "@/data/comparisons";

// Edge-safe: COMPARISON_PAGES is a pure static object with no fs/path use.
export const runtime = "edge";
export const alt = "Fund Comparison — BuyVEQT";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comparison = COMPARISON_PAGES[slug];

  const funds = slug.split("-vs-").map((f) => f.toUpperCase());
  const fundA = funds[0] || "VEQT";
  const fundB = funds[1] || "???";

  // Prefer the curated metaDescription as the dek — it's a single tight
  // sentence and won't get truncated awkwardly by intra-decimal periods.
  const dek =
    comparison?.metaDescription ??
    `Side-by-side comparison of ${fundA} and ${fundB} — fees, allocation, and verdicts.`;

  return renderBroadsheetOG({
    eyebrow: "Head to Head",
    title: `${fundA} vs. ${fundB}`,
    italic: true,
    dek,
    footerNote: comparison ? `${fundA} · ${fundB}` : "Comparison",
    alt: `${fundA} vs. ${fundB} — BuyVEQT`,
  });
}
