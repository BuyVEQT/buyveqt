import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";

export const alt = "Learn — VEQT & Canadian Passive Investing";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderInstrumentOG({
    eyebrow: "THE ARCHIVE",
    titleLines: ["Learn the", "long game."],
    dek: "Dispatches on VEQT, account selection, behavior, and the boring discipline of passive investing.",
    chipLabel: "25+ DISPATCHES",
    chipMark: false,
    statLabel: "6 LEARN PATHS",
    alt,
  });
}
