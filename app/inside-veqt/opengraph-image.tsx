import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";

export const alt = "Inside VEQT — Holdings, Sectors & Geographic Allocation";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderInstrumentOG({
    eyebrow: "INSIDE THE FUND",
    titleLines: ["What you own", "when you own VEQT."],
    chipLabel: "ONE TICKER, FOUR SLEEVES",
    chipMark: false,
    // The old dek — "approximately 13,700 stocks across 50 countries, held
    // through four Vanguard index ETFs" — said in the home hero's facts
    // grammar instead of a sentence. Same three numbers, instrument voice.
    stats: [
      { label: "STOCKS HELD", value: "~13,700" },
      { label: "COUNTRIES", value: "50" },
      { label: "UNDERLYING ETFs", value: "4" },
    ],
    alt,
  });
}
