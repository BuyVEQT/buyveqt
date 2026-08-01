import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";
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
    return renderInstrumentOG({
      eyebrow: "THE WIRE",
      titleLines: ["Recap", "not found."],
      chipLabel: "THE WIRE",
      chipMark: false,
      alt,
    });
  }

  const ordinal = getRecapOrdinal(slug);
  const range = formatWeekRange(recap.weekStart, recap.weekEnd);
  const changeSign = recap.weeklyChangePercent >= 0 ? "+" : "";
  const moveSummary = `${changeSign}${recap.weeklyChangePercent.toFixed(2)}% ON THE WEEK`;

  return renderInstrumentOG({
    eyebrow: "THE WIRE",
    title: recap.title,
    dek: recap.description,
    chipLabel: ordinal
      ? `ISSUE NO. ${String(ordinal).padStart(2, "0")}`
      : "THE WIRE",
    chipMark: false,
    // The old footer line — "Nov 3 – Nov 7 · +1.24% on the week" — as the
    // micro-label beside the chip.
    statLabel: range
      ? `${range.toUpperCase()} · ${moveSummary}`
      : moveSummary,
    alt: `${recap.title} — BuyVEQT`,
  });
}
