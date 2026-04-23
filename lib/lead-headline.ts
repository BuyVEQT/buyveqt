import type { Region } from "@/lib/useRegions";

export interface NewsContext {
  sentiment: "bearish" | "neutral" | "bullish";
  /** How many news items were averaged. We only lean into sentiment when this is confident. */
  itemCount: number;
}

export interface LeadCopy {
  /** Small-caps kicker above the headline. Short, categorical. */
  deck: string;
  /** The main editorial statement. Single line or two — whatever flows. */
  headline: string;
  /**
   * Optional one-line coda that ties the tape to the wire: "The wire agrees.",
   * "Against the wire.", "The wire is silent." etc. Omitted on quiet days.
   */
  coda?: string;
}

type BaseCopy = Pick<LeadCopy, "deck" | "headline">;

/**
 * Compose the Lead deck + headline + optional coda from live data.
 *
 * Two signals:
 *   1. Magnitude × regional attribution (primary) — drives deck + headline.
 *   2. News sentiment (secondary) — appends a short coda when the wire
 *      clearly agrees with or contradicts the tape. Never fabricated;
 *      the coda pool is a handful of hand-written one-liners, selected
 *      deterministically from the alignment × magnitude grid.
 *
 * Neutral sentiment, thin coverage (<3 items), or flat sessions produce
 * no coda — the headline stands on its own.
 */
export function computeLeadHeadline(
  veqtChangePercent: number | null | undefined,
  regions: readonly Region[] = [],
  news?: NewsContext
): LeadCopy {
  const base = computeBase(veqtChangePercent, regions);

  if (
    veqtChangePercent === null ||
    veqtChangePercent === undefined ||
    !news ||
    news.sentiment === "neutral" ||
    news.itemCount < 3
  ) {
    return base;
  }

  const mag = Math.abs(veqtChangePercent);
  // Don't tie a coda to a flat session — it reads as forced.
  if (mag < 0.2) return base;

  const up = veqtChangePercent >= 0;
  const coda = pickCoda(up, mag, news.sentiment);
  return coda ? { ...base, coda } : base;
}

/**
 * Pick a coda from the alignment × magnitude grid.
 * Returns null for ambiguous cases (we'd rather say nothing than stretch).
 */
function pickCoda(
  up: boolean,
  mag: number,
  sentiment: "bearish" | "bullish"
): string | null {
  const sharp = mag >= 1.5;
  const aligned = (up && sentiment === "bullish") || (!up && sentiment === "bearish");

  if (aligned) {
    // Tape and wire agree.
    if (up && sharp) return "Bullish headlines, confirmed.";
    if (up) return "The wire agrees.";
    if (!up && sharp) return "The wire confirms the slide.";
    return "Bearish on the page, bearish on the wire.";
  }

  // Tape and wire disagree — contrarian note.
  if (up && sharp) return "A rally against a bearish wire.";
  if (up) return "Up, despite a cautious wire.";
  if (!up && sharp) return "The tape bleeds through bullish headlines.";
  return "Down, despite an optimistic wire.";
}

// ──────────────────────────────────────────────────────────────
// Base copy — magnitude × regional attribution. Unchanged from the
// prior iteration. Split out so the public function can layer coda on top.
// ──────────────────────────────────────────────────────────────

function computeBase(
  veqtChangePercent: number | null | undefined,
  regions: readonly Region[]
): BaseCopy {
  if (veqtChangePercent === null || veqtChangePercent === undefined) {
    return { deck: "The Lead · Today", headline: "The tape awaits." };
  }

  const mag = Math.abs(veqtChangePercent);
  const up = veqtChangePercent >= 0;

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
  const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (mag < 0.2) {
    return { deck: "A quiet tape", headline: "Little movement on the day." };
  }

  if (mag < 0.7) {
    if (!leader) {
      return up
        ? { deck: "Green ink", headline: "A gentle session." }
        : { deck: "Red ink", headline: "A narrow pullback." };
    }
    if (leaderAligned) {
      return up
        ? {
            deck: "Green ink",
            headline: `${capFirst(regionPhrase(leader))} helped the tape.`,
          }
        : {
            deck: "Red ink",
            headline: `${capFirst(regionPhrase(leader))} weighed on the day.`,
          };
    }
    return up
      ? {
          deck: "Green ink",
          headline: `${capFirst(regionPhrase(leader))} held the tape back.`,
        }
      : {
          deck: "Red ink",
          headline: `${capFirst(regionPhrase(leader))} cushioned the fall.`,
        };
  }

  if (mag < 1.5) {
    if (consensus && up) {
      return { deck: "A broad rally", headline: "Every region in the green." };
    }
    if (consensus && !up) {
      return { deck: "A broad decline", headline: "Every region in the red." };
    }
    if (!leader) {
      return up
        ? { deck: "A strong session", headline: "Green ink across the tape." }
        : { deck: "A rough session", headline: "Red ink across the tape." };
    }
    return up
      ? {
          deck: "A strong session",
          headline: `${capFirst(regionPhrase(leader))} out in front.`,
        }
      : {
          deck: "A rough session",
          headline: `${capFirst(regionPhrase(leader))} drags the tape.`,
        };
  }

  if (mag < 2.5) {
    if (!leader) {
      return up
        ? { deck: "A rally", headline: "The tape runs hot." }
        : { deck: "A sell-off", headline: "The tape bleeds." };
    }
    return up
      ? {
          deck: "A rally",
          headline: `${capFirst(regionPhrase(leader))} leads.`,
        }
      : {
          deck: "A sell-off",
          headline: `${capFirst(regionPhrase(leader))} leads the slide.`,
        };
  }

  if (!leader) {
    return up
      ? { deck: "A surge", headline: "The world rips higher." }
      : { deck: "A rout", headline: "The world gives it up." };
  }
  return up
    ? {
        deck: "A surge",
        headline: `${capFirst(regionPhrase(leader))} drives the tape.`,
      }
    : {
        deck: "A rout",
        headline: `${capFirst(regionPhrase(leader))} drives the fall.`,
      };
}
