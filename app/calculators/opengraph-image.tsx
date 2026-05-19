import { renderBroadsheetOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/broadsheet";

export const runtime = "edge";
export const alt = "The Math — VEQT Calculators";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderBroadsheetOG({
    eyebrow: "The Math",
    title: "Run the numbers.",
    italic: true,
    dek: "Inception lookback, lump sum vs. DCA, and Monte Carlo projections — every calculator a Canadian VEQT investor needs.",
    footerNote: "3 calculators · live prices",
    alt,
  });
}
