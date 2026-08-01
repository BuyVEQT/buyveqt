import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";
import { LEARN_PATHS } from "@/lib/learn-paths-data";

export const alt = "All Learn Paths — Six Ways In";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderInstrumentOG({
    eyebrow: "LEARN PATHS",
    titleLines: ["Six ways in."],
    dek: "Six curated reading paths through the VEQT corpus. Each is 4–6 dispatches in the order we think they belong.",
    chipLabel: `${LEARN_PATHS.length} PATHS`,
    chipMark: false,
    statLabel: "4–6 DISPATCHES EACH",
    alt,
  });
}
