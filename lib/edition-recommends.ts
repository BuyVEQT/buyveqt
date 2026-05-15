/**
 * Builds the day's editorial recommendation — the "Editor's take" board on
 * the home page. Two jobs:
 *
 *   1. Compose a verdict sentence from the day's actual numbers (today's %,
 *      percentile rank, leading region, σ band) so the board reads like
 *      today's tape, not one of twelve recycled stencils.
 *   2. Pick a "read next" article from a pool that fits the day's character.
 *      The pick is deterministic on `dateKey` so it's stable for a session
 *      but rotates across sessions, broadening which archive pieces surface
 *      on the home page over time.
 *
 * Both choices use the same FNV-1a hash of `dateKey + salt` so the verdict
 * template and the article pick rotate independently.
 */
import type { Region } from "@/lib/useRegions";
import type { SeverityReading, SeverityZone } from "@/lib/severity";

export type Direction = "up" | "down" | "flat";

export interface EditionRecommendation {
  zoneLabel: string;
  verdict: string;
  href: string;
  linkLabel: string;
}

interface ArticleRef {
  slug: string;
  linkLabel: string;
}

const ARTICLE_LIBRARY: Record<string, ArticleRef> = {
  "why-timing-the-market-fails": {
    slug: "why-timing-the-market-fails",
    linkLabel: "Why timing the market fails",
  },
  "passive-investing-behavioral-edge": {
    slug: "passive-investing-behavioral-edge",
    linkLabel: "The behavioural edge of passive investing",
  },
  "automate-veqt-purchases": {
    slug: "automate-veqt-purchases",
    linkLabel: "Put your VEQT buys on autopilot",
  },
  "veqt-mer-true-cost": {
    slug: "veqt-mer-true-cost",
    linkLabel: "What VEQT's MER actually costs you",
  },
  "veqt-distributions-explained": {
    slug: "veqt-distributions-explained",
    linkLabel: "VEQT distributions, explained",
  },
  "veqt-decision-flowchart": {
    slug: "veqt-decision-flowchart",
    linkLabel: "I have money to invest — what now?",
  },
  "why-stocks-go-up": {
    slug: "why-stocks-go-up",
    linkLabel: "Why stocks go up over decades",
  },
  "veqt-vs-vfv": {
    slug: "veqt-vs-vfv",
    linkLabel: "VEQT vs VFV: don't just chase the S&P 500",
  },
  "veqt-vs-vgro": {
    slug: "veqt-vs-vgro",
    linkLabel: "VEQT vs VGRO: do you want bonds in the mix?",
  },
  "veqt-is-down": {
    slug: "veqt-is-down",
    linkLabel: "VEQT is down — what now?",
  },
  "veqt-currency-risk": {
    slug: "veqt-currency-risk",
    linkLabel: "How the loonie moves your VEQT",
  },
  "lump-sum-vs-dca": {
    slug: "lump-sum-vs-dca",
    linkLabel: "Lump sum vs. DCA on a drawdown",
  },
};

const POOLS: Record<SeverityZone, Record<Direction, readonly string[]>> = {
  Typical: {
    up: [
      "why-timing-the-market-fails",
      "automate-veqt-purchases",
      "veqt-mer-true-cost",
      "passive-investing-behavioral-edge",
    ],
    down: [
      "why-timing-the-market-fails",
      "passive-investing-behavioral-edge",
      "automate-veqt-purchases",
      "veqt-mer-true-cost",
    ],
    flat: [
      "why-timing-the-market-fails",
      "passive-investing-behavioral-edge",
      "veqt-distributions-explained",
      "automate-veqt-purchases",
    ],
  },
  Notable: {
    up: [
      "why-timing-the-market-fails",
      "passive-investing-behavioral-edge",
      "veqt-vs-vfv",
      "automate-veqt-purchases",
    ],
    down: [
      "veqt-is-down",
      "passive-investing-behavioral-edge",
      "why-timing-the-market-fails",
      "veqt-decision-flowchart",
    ],
    flat: [
      "passive-investing-behavioral-edge",
      "why-timing-the-market-fails",
      "veqt-currency-risk",
      "automate-veqt-purchases",
    ],
  },
  Unusual: {
    up: [
      "why-stocks-go-up",
      "why-timing-the-market-fails",
      "passive-investing-behavioral-edge",
      "veqt-vs-vfv",
    ],
    down: [
      "veqt-is-down",
      "why-stocks-go-up",
      "passive-investing-behavioral-edge",
      "lump-sum-vs-dca",
    ],
    flat: [
      "passive-investing-behavioral-edge",
      "veqt-currency-risk",
      "why-stocks-go-up",
      "why-timing-the-market-fails",
    ],
  },
  Rare: {
    up: [
      "why-stocks-go-up",
      "passive-investing-behavioral-edge",
      "why-timing-the-market-fails",
      "veqt-vs-vfv",
    ],
    down: [
      "veqt-is-down",
      "why-stocks-go-up",
      "passive-investing-behavioral-edge",
      "lump-sum-vs-dca",
    ],
    flat: [
      "passive-investing-behavioral-edge",
      "veqt-currency-risk",
      "why-stocks-go-up",
      "why-timing-the-market-fails",
    ],
  },
};

export function direction(changePercent: number): Direction {
  if (changePercent > 0.1) return "up";
  if (changePercent < -0.1) return "down";
  return "flat";
}

// FNV-1a — small, fast, no deps. We only need a stable index from a string.
function fnv1aHash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pickFromPool<T>(pool: readonly T[], dateKey: string, salt: string): T {
  const idx = fnv1aHash(`${dateKey}|${salt}`) % pool.length;
  return pool[idx];
}

function regionPhrase(region: string): string {
  switch (region) {
    case "US":
      return "the U.S.";
    case "Canada":
      return "Canada";
    case "International":
      return "developed markets";
    case "Emerging Markets":
      return "emerging markets";
    default:
      return region.toLowerCase();
  }
}

function leadingRegion(regions: readonly Region[]): Region | null {
  const ranked = regions
    .filter((r) => !r.error && typeof r.contribution === "number")
    .slice()
    .sort(
      (a, b) =>
        Math.abs(b.contribution ?? 0) - Math.abs(a.contribution ?? 0)
    );
  return ranked[0] ?? null;
}

function fmtPct(x: number, digits = 2): string {
  const sign = x >= 0 ? "+" : "−";
  return `${sign}${Math.abs(x).toFixed(digits)}%`;
}

function fmtAbsBand(sigma: number, digits = 2): string {
  return `±${sigma.toFixed(digits)}%`;
}

function zoneLabel(zone: SeverityZone, dir: Direction): string {
  if (dir === "up") return `${zone} · Up`;
  if (dir === "down") return `${zone} · Down`;
  return zone;
}

interface VerdictContext {
  reading: SeverityReading;
  dir: Direction;
  leader: Region | null;
  dateKey: string;
}

function composeVerdict(ctx: VerdictContext): string {
  const { reading, dir, leader, dateKey } = ctx;
  const today = fmtPct(reading.todayChangePercent);
  const sigmaBand = fmtAbsBand(reading.typicalMovePercent);
  const pct = Math.round(reading.percentileRank * 100);
  const calmerThan = Math.max(0, 100 - pct);
  const year = reading.sampleFromYear;
  const leaderTag = leader ? regionPhrase(leader.region) : null;

  const t = (templates: readonly string[]): string =>
    pickFromPool(templates, dateKey, "verdict");

  switch (reading.zone) {
    case "Typical": {
      if (dir === "up") {
        return t([
          `${today} — quieter than ${calmerThan}% of sessions since ${year}. Hold, contribute on schedule, today is noise.`,
          `${today}, well inside the typical ${sigmaBand} day. Don't reach for the buy button.`,
          leaderTag
            ? `${today}, with ${leaderTag} doing most of the lifting. The day is normal — your behaviour should be too.`
            : `${today}, an ordinary green session. Stay on schedule.`,
        ]);
      }
      if (dir === "down") {
        return t([
          `${today} — quieter than ${calmerThan}% of sessions since ${year}. Today is noise; tomorrow is just as random.`,
          `${today}, well inside the typical ${sigmaBand} day. Hold, contribute on schedule.`,
          leaderTag
            ? `${today}, with ${leaderTag} doing most of the dragging. The day is normal — don't act on it.`
            : `${today}, an ordinary red session. Nothing here for you to do.`,
        ]);
      }
      return t([
        `${today}, essentially flat. Markets do this most days; the screen owes you nothing.`,
        `${today} — flatter than ${pct}% of sessions since ${year}. Nothing to react to.`,
        `Quiet on the tape. The compounding happens whether you watch or not.`,
      ]);
    }
    case "Notable": {
      if (dir === "up") {
        return t([
          `${today} — bigger than ${pct}% of sessions but still inside the normal ${sigmaBand} range. Don't chase the green; don't add ahead of plan.`,
          leaderTag
            ? `${today}, with ${leaderTag} leading. Notable, not unusual. Hold.`
            : `${today}. Notable, not unusual. Hold.`,
          `${today}, a step above ordinary. The right move is the same as yesterday's: nothing.`,
        ]);
      }
      if (dir === "down") {
        return t([
          `${today} — bigger than ${pct}% of sessions but still inside the normal ${sigmaBand} range. Today's not the day to flinch.`,
          leaderTag
            ? `${today}, with ${leaderTag} leading lower. Uncomfortable, not unusual. Hold.`
            : `${today}. Uncomfortable, not unusual. Hold.`,
          `${today}, a step worse than ordinary. The plan handled bigger; it'll handle this.`,
        ]);
      }
      return t([
        `${today}, but mixed underneath. Inside the normal range; nothing demanding action.`,
        `${today} — small headline, busy regions. Sit on your hands.`,
      ]);
    }
    case "Unusual": {
      if (dir === "up") {
        return t([
          `${today} — top ${calmerThan}% of green days since ${year}. Big rallies pull new money in late; you're already in.`,
          leaderTag
            ? `${today}, ${leaderTag} doing the heavy lifting. Stay on schedule — chasing rallies is a known way to underperform them.`
            : `${today}, well outside the normal ${sigmaBand} day. Stay on schedule.`,
          `${today}, an outsized rally. The next session is just as random as any other; don't extrapolate.`,
        ]);
      }
      if (dir === "down") {
        return t([
          `${today} — top ${calmerThan}% of red days since ${year}. Resist the urge to check again before tomorrow.`,
          leaderTag
            ? `${today}, ${leaderTag} dragging the fund down. The portfolio is built for this; you don't need to be.`
            : `${today}, well outside the normal ${sigmaBand} day. Hold.`,
          `${today}, an outsized drop. Days like this are why long-run returns are paid out at all.`,
        ]);
      }
      return t([
        `${today}, but the regions tell a louder story. Read past the headline number.`,
        `${today}, an unusual session masked by a quiet headline. Hold.`,
      ]);
    }
    case "Rare": {
      if (dir === "up") {
        return t([
          `${today} — among the largest green moves since ${year}. Days like this are why you stay invested through the dull ones.`,
          `${today}, a rare green session. Don't add on emotion; don't sell to lock it in.`,
          leaderTag
            ? `${today}, ${leaderTag} carrying the day. Rallies this size are uncommon — and uncommon to repeat.`
            : `${today}, a rare rally. The plan didn't change; your behaviour shouldn't either.`,
        ]);
      }
      if (dir === "down") {
        return t([
          `${today} — among the largest red moves since ${year}. Days like this are exactly what your time horizon is for.`,
          `${today}, a rare drop. Selling locks the loss in; the historical record says recoveries happen to people who stayed in.`,
          leaderTag
            ? `${today}, ${leaderTag} the worst-affected sleeve. The fund rebalances itself; your job is not to.`
            : `${today}, a rare red session. Hold and look away.`,
        ]);
      }
      return t([
        `${today}, but a rare day underneath. The regions moved hard and offset; the headline lies.`,
        `${today}, a rare session disguised as quiet. Don't be fooled by the round number.`,
      ]);
    }
  }
}

export interface RecommendationInputs {
  reading: SeverityReading;
  regions: readonly Region[];
  /** YYYY-MM-DD seed for deterministic article + verdict rotation. */
  dateKey: string;
}

export function buildRecommendation({
  reading,
  regions,
  dateKey,
}: RecommendationInputs): EditionRecommendation {
  const dir = direction(reading.todayChangePercent);
  const pool = POOLS[reading.zone][dir];
  const slug = pickFromPool(pool, dateKey, "article");
  const article = ARTICLE_LIBRARY[slug];
  const leader = leadingRegion(regions);
  const verdict = composeVerdict({ reading, dir, leader, dateKey });

  return {
    zoneLabel: zoneLabel(reading.zone, dir),
    verdict,
    href: `/learn/${article.slug}`,
    linkLabel: article.linkLabel,
  };
}
