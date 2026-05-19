import { renderBroadsheetOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/broadsheet";

export const runtime = "edge";
export const alt = "The Colophon — Sources, Methods, Fine Print";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderBroadsheetOG({
    eyebrow: "The Colophon",
    title: "Sources, methods, fine print.",
    italic: true,
    dek: "Where our data comes from, how we calculate every figure, and what to remember about a community resource.",
    footerNote: "Not investment advice",
    alt,
  });
}
