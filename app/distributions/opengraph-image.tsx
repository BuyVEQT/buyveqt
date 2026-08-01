import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";

export const alt = "The Annual — VEQT Distribution History & Income";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderInstrumentOG({
    eyebrow: "THE ANNUAL",
    titleLines: ["One envelope,", "every December."],
    dek: "Six years of VEQT distributions, payment dates, and after-tax math for every Canadian account type.",
    chipLabel: "ANNUAL DISTRIBUTION",
    chipMark: false,
    statLabel: "SINCE 2019",
    alt,
  });
}
