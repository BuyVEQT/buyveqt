import type { Region } from "@/lib/useRegions";

/**
 * Compute the editorial eyebrow line above the main headline.
 *
 * The inputs are real: VEQT's daily change % and live contributions from
 * each underlying sleeve (VCN/VUN/VIU/VEE). We combine MAGNITUDE of the
 * move with the sleeve that DROVE it to produce a telegraph-style phrase.
 * No news APIs are involved — the attribution IS the driver narrative.
 *
 * Kept as a pure function so it's trivially testable and SSR-safe.
 */
export function computeLeadHeadline(
  veqtChangePercent: number | null | undefined,
  regions: readonly Region[] = []
): string {
  // No live data yet → neutral placeholder, doesn't claim a direction.
  if (veqtChangePercent === null || veqtChangePercent === undefined) {
    return "The Lead · Today";
  }

  const mag = Math.abs(veqtChangePercent);
  const up = veqtChangePercent >= 0;

  // Identify the region that contributed most to the move (by absolute bp).
  // We trust the sign of `contribution` (weight × regional change %) rather
  // than regional change % alone, because a small sleeve with a big move
  // still matters less than a big sleeve with a modest move.
  const ranked = regions
    .filter((r) => !r.error && typeof r.contribution === "number")
    .slice()
    .sort(
      (a, b) =>
        Math.abs((b.contribution ?? 0)) - Math.abs((a.contribution ?? 0))
    );
  const leader = ranked[0];

  // Leader's directional role: is it pulling the same way as VEQT, or against?
  const leaderAligned =
    leader !== undefined &&
    typeof leader.contribution === "number" &&
    ((leader.contribution >= 0 && up) || (leader.contribution < 0 && !up));

  // Regional consensus — are all four pulling the same direction as VEQT?
  const consensus =
    regions.length >= 4 &&
    regions.every(
      (r) =>
        r.error ||
        r.changePercent === null ||
        (up ? r.changePercent >= 0 : r.changePercent <= 0)
    );

  const regionPhrase = (r: Region): string => {
    // Shorter, headline-friendly region names.
    switch (r.region) {
      case "US":
        return "The U.S.";
      case "Canada":
        return "Canada";
      case "International":
        return "Developed markets";
      case "Emerging Markets":
        return "Emerging markets";
      default:
        return r.label;
    }
  };

  // ── Flat session ─────────────────────────────────────────
  if (mag < 0.2) {
    return "A quiet tape · little movement on the day";
  }

  // ── Modest session (0.2% – 0.7%) ─────────────────────────
  if (mag < 0.7) {
    if (!leader) {
      return up ? "A gentle green session" : "A gentle red session";
    }
    if (leaderAligned) {
      return up
        ? `Green ink · ${regionPhrase(leader).toLowerCase()} helped`
        : `Red ink · ${regionPhrase(leader).toLowerCase()} weighed`;
    }
    return up
      ? `Narrow gain · ${regionPhrase(leader).toLowerCase()} held back`
      : `Narrow loss · ${regionPhrase(leader).toLowerCase()} cushioned`;
  }

  // ── Notable session (0.7% – 1.5%) ────────────────────────
  if (mag < 1.5) {
    if (consensus && up) return "A broad rally · every region in the green";
    if (consensus && !up) return "A broad decline · every region in the red";
    if (!leader) {
      return up ? "A strong session in green" : "A rough session in red";
    }
    return up
      ? `${regionPhrase(leader)} out in front · strong green tape`
      : `${regionPhrase(leader)} drags · red ink across the page`;
  }

  // ── Sharp session (1.5% – 2.5%) ──────────────────────────
  if (mag < 2.5) {
    if (!leader) {
      return up ? "A rally on the tape" : "A sell-off on the tape";
    }
    return up
      ? `A rally · ${regionPhrase(leader).toLowerCase()} leads`
      : `A sell-off · ${regionPhrase(leader).toLowerCase()} leads the slide`;
  }

  // ── Extreme session (≥ 2.5%) ─────────────────────────────
  if (!leader) {
    return up
      ? "An extraordinary green session"
      : "An extraordinary red session";
  }
  return up
    ? `A surge · ${regionPhrase(leader).toLowerCase()} drives the tape`
    : `A rout · ${regionPhrase(leader).toLowerCase()} drives the fall`;
}
