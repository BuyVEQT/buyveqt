import { renderBroadsheetOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/broadsheet";

export const runtime = "edge";
export const alt = "The Wire — VEQT Week-by-Week Recaps";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderBroadsheetOG({
    eyebrow: "The Wire",
    title: "VEQT, week by week.",
    italic: true,
    dek: "Weekly recaps for VEQT holders: what moved, what didn't, and what the regional sleeves are telling us.",
    footerNote: "Updated every Friday",
    alt,
  });
}
