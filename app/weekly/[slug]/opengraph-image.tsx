import { renderBroadsheetOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/broadsheet";
import { getWeeklyRecapBySlug, getRecapOrdinal } from "@/lib/weekly";

// Node runtime: getWeeklyRecapBySlug reads MDX from disk.
export const alt = "Weekly Recap — BuyVEQT";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

function formatWeekRange(start: string, end: string): string {
  try {
    const s = new Date(start);
    const e = new Date(end);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
    const fmt = new Intl.DateTimeFormat("en-CA", {
      month: "short",
      day: "numeric",
    });
    return `${fmt.format(s)} – ${fmt.format(e)}`;
  } catch {
    return "";
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recap = getWeeklyRecapBySlug(slug);

  if (!recap) {
    return renderBroadsheetOG({
      eyebrow: "The Wire",
      title: "Recap not found.",
      alt,
    });
  }

  const ordinal = getRecapOrdinal(slug);
  const range = formatWeekRange(recap.weekStart, recap.weekEnd);
  const changeSign = recap.weeklyChangePercent >= 0 ? "+" : "";
  const moveSummary = `${changeSign}${recap.weeklyChangePercent.toFixed(2)}% on the week`;

  return renderBroadsheetOG({
    eyebrow: ordinal ? `The Wire · Issue No. ${String(ordinal).padStart(2, "0")}` : "The Wire",
    title: recap.title,
    italic: true,
    dek: recap.description,
    footerNote: range ? `${range} · ${moveSummary}` : moveSummary,
    alt: `${recap.title} — BuyVEQT`,
  });
}
