import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";

export const alt = "The Wire — VEQT Week-by-Week Recaps";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderInstrumentOG({
    eyebrow: "THE WIRE",
    titleLines: ["VEQT, week", "by week."],
    dek: "Weekly recaps for VEQT holders: what moved, what didn't, and what the regional sleeves are telling us.",
    chipLabel: "UPDATED EVERY FRIDAY",
    chipMark: false,
    alt,
  });
}
