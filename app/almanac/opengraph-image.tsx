import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";

export const alt = "The Almanac — VEQT's loudest days on file";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderInstrumentOG({
    eyebrow: "THE ALMANAC · SINCE 2019",
    titleLines: ["Days worth", "remembering."],
    dek: "Every VEQT session that broke the 90th percentile — rallies, gales, surges and squalls, newest first.",
    chipLabel: "THE ARCHIVE OF EDITIONS",
    chipMark: false,
    statLabel: "TOP 10% OF SESSIONS",
    alt,
  });
}
