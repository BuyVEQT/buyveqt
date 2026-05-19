import { renderBroadsheetOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/broadsheet";

export const runtime = "edge";
export const alt = "The Annual — VEQT Distribution History & Income";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderBroadsheetOG({
    eyebrow: "The Annual",
    title: "One envelope, every December.",
    italic: true,
    dek: "Six years of VEQT distributions, payment dates, and after-tax math for every Canadian account type.",
    footerNote: "Annual distribution · since 2019",
    alt,
  });
}
