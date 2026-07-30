import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";

export const runtime = "edge";
export const alt =
  "BuyVEQT — One fund. The whole world. An independent broadsheet on the boring fund.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderInstrumentOG({
    titleLines: ["One fund.", "The whole world."],
    chipLabel: "THE BORING FUND",
    statLabel: "$CAD · TSX: VEQT · 13,700+ STOCKS",
    microLabel: "VEQT.TO · TORONTO",
    footerNote: "AN INDEPENDENT BROADSHEET ON THE BORING FUND — BUYVEQT.COM",
    alt,
  });
}
