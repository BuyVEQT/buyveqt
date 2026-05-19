import { renderBroadsheetOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/broadsheet";

export const runtime = "edge";
export const alt = "Learn — VEQT & Canadian Passive Investing";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderBroadsheetOG({
    eyebrow: "The Archive",
    title: "Learn the long game.",
    italic: true,
    dek: "Dispatches on VEQT, account selection, behavior, and the boring discipline of passive investing.",
    footerNote: "25+ dispatches · 6 learn paths",
    alt,
  });
}
