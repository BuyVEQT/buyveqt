import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";

export const alt = "The Math — VEQT Calculators";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderInstrumentOG({
    eyebrow: "THE MATH",
    titleLines: ["Run the numbers."],
    dek: "Inception lookback, lump sum vs. DCA, and Monte Carlo projections — every calculator a Canadian VEQT investor needs.",
    chipLabel: "3 CALCULATORS",
    chipMark: false,
    statLabel: "LIVE PRICES",
    alt,
  });
}
