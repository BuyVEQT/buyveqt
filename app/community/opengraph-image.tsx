import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";

export const alt = "The Forum — r/JustBuyVEQT";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderInstrumentOG({
    eyebrow: "THE FORUM",
    titleLines: ["Letters from", "the holders."],
    dek: "Live discussion from r/JustBuyVEQT — questions, milestones, and the long-term mindset, in their own words.",
    chipLabel: "R/JUSTBUYVEQT",
    chipMark: false,
    statLabel: "COMMUNITY-CURATED",
    alt,
  });
}
