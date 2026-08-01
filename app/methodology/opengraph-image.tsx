import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";

export const alt = "The Colophon — Sources, Methods, Fine Print";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderInstrumentOG({
    eyebrow: "THE COLOPHON",
    titleLines: ["Sources, methods,", "fine print."],
    dek: "Where our data comes from, how we calculate every figure, and what to remember about a community resource.",
    chipLabel: "NOT INVESTMENT ADVICE",
    chipMark: false,
    alt,
  });
}
