import { renderBroadsheetOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/broadsheet";

export const runtime = "edge";
export const alt = "Inside VEQT — Holdings, Sectors & Geographic Allocation";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderBroadsheetOG({
    eyebrow: "Inside the Fund",
    title: "What you own when you own VEQT.",
    dek: "Approximately 13,700 stocks across 50 countries, held through four Vanguard index ETFs.",
    footerNote: "4 ETFs · 50 countries",
    alt,
  });
}
