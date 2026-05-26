import { renderBroadsheetOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/broadsheet";

export const runtime = "edge";
export const alt = "Compare Canadian ETFs — BuyVEQT";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderBroadsheetOG({
    eyebrow: "Comparisons",
    title: "VEQT vs the field.",
    italic: true,
    dek: "Head-to-head matchups with XEQT, ZEQT, CAGE, VGRO, and VFV — fees, allocation, and live verdicts.",
    footerNote: "5 matchups · live data",
    alt,
  });
}
