import type { Region } from "@/lib/useRegions";

export interface LeadCopy {
  /** One-sentence summary of today's move. Direct, no newspaper jargon. */
  headline: string;
}

/**
 * Compose a single, direct one-sentence headline from the VEQT move and the
 * four regional sleeves. Reads like an analyst's one-liner, not like a
 * newspaper department note.
 *
 * Inputs are the two pieces of real data we already fetch; no news,
 * no LLM, no fabricated decks. If the day is ambiguous (insufficient
 * regional data, tiny move, counter-trend leader), we fall back to a
 * plain "Up today." / "Down today." rather than stretching.
 */
export function computeLeadHeadline(
  veqtChangePercent: number | null | undefined,
  regions: readonly Region[] = []
): LeadCopy {
  if (veqtChangePercent === null || veqtChangePercent === undefined) {
    return { headline: "Today's tape awaits." };
  }

  const mag = Math.abs(veqtChangePercent);
  const up = veqtChangePercent >= 0;

  // A flat session. Don't manufacture a story.
  if (mag < 0.1) {
    return { headline: "Quiet on the day." };
  }

  const ranked = regions
    .filter((r) => !r.error && typeof r.contribution === "number")
    .slice()
    .sort(
      (a, b) =>
        Math.abs((b.contribution ?? 0)) - Math.abs((a.contribution ?? 0))
    );
  const leader = ranked[0];

  const leaderAligned =
    leader !== undefined &&
    typeof leader.contribution === "number" &&
    ((leader.contribution >= 0 && up) || (leader.contribution < 0 && !up));

  const consensus =
    regions.length >= 4 &&
    regions.every(
      (r) =>
        r.error ||
        r.changePercent === null ||
        (up ? r.changePercent >= 0 : r.changePercent <= 0)
    );

  const regionPhrase = (r: Region): string => {
    switch (r.region) {
      case "US":
        return "the U.S.";
      case "Canada":
        return "Canada";
      case "International":
        return "developed markets";
      case "Emerging Markets":
        return "emerging markets";
      default:
        return r.label.toLowerCase();
    }
  };

  // Broad consensus across all four sleeves.
  if (consensus) {
    return up
      ? { headline: "A broad rally — every region higher." }
      : { headline: "A broad decline — every region lower." };
  }

  // Leader moved with the fund — the clean attribution.
  if (leader && leaderAligned) {
    return up
      ? { headline: `Up on the day. Led by ${regionPhrase(leader)}.` }
      : { headline: `Down on the day. Led lower by ${regionPhrase(leader)}.` };
  }

  // Leader moved against the fund — name the drag.
  if (leader && !leaderAligned) {
    return up
      ? { headline: `Up on the day, despite weakness in ${regionPhrase(leader)}.` }
      : { headline: `Down on the day, despite strength in ${regionPhrase(leader)}.` };
  }

  // No regional data — plain fallback.
  return up ? { headline: "Up on the day." } : { headline: "Down on the day." };
}
