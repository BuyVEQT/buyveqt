import { renderBroadsheetOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/broadsheet";

export const runtime = "edge";
export const alt = "BuyVEQT — The VEQT Investor Community Hub";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderBroadsheetOG({
    eyebrow: "Today · Front Page",
    title: "One ETF. The whole world.",
    italic: true,
    dek: "Live data, fund comparisons, and editorial coverage for Canadian VEQT investors.",
    footerNote: "13,700+ stocks · 50 countries",
    alt,
  });
}
