import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";

export const alt = "Compare Canadian ETFs — BuyVEQT";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderInstrumentOG({
    eyebrow: "COMPARISONS",
    titleLines: ["VEQT vs.", "the field."],
    dek: "Head-to-head matchups with XEQT, ZEQT, CAGE, VGRO, and VFV — fees, allocation, and live verdicts.",
    chipLabel: "5 MATCHUPS",
    chipMark: false,
    statLabel: "LIVE DATA",
    alt,
  });
}
