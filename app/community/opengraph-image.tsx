import { renderBroadsheetOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/broadsheet";

export const runtime = "edge";
export const alt = "The Forum — r/JustBuyVEQT";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderBroadsheetOG({
    eyebrow: "The Forum",
    title: "Letters from the holders.",
    italic: true,
    dek: "Live discussion from r/JustBuyVEQT — questions, milestones, and the long-term mindset, in their own words.",
    footerNote: "r/JustBuyVEQT · community-curated",
    alt,
  });
}
