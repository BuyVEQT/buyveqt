import type { RedditPost } from "@/lib/data/reddit";

/**
 * Shared helpers for the Instrument /community modules.
 *
 * Both the hero (latest-thread fact) and the pulse cells need the same
 * relative-age string, and the mood bar needs a single, auditable
 * definition of "a thread that mentions the downside".
 */

/** Relative age of a post — "2h ago", "3d ago", "1y ago". */
export function formatAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days >= 365) return `${Math.floor(days / 365)}y ago`;
  if (days >= 30) return `${Math.floor(days / 30)}mo ago`;
  if (days >= 7) return `${Math.floor(days / 7)}w ago`;
  if (days >= 1) return `${days}d ago`;
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours >= 1) return `${hours}h ago`;
  const mins = Math.floor(diffMs / 60_000);
  if (mins >= 1) return `${mins}m ago`;
  return "just now";
}

/**
 * Downside / doubt vocabulary.
 *
 * This is a KEYWORD SPLIT, not a sentiment model, and the module labels
 * say so out loud. It only claims what it can prove: the title contains
 * one of these words. Everything else falls in the other bucket — the
 * bar's ink share is "everything else", never "bullish".
 *
 * Word boundaries matter: `\bred\b` must not fire on "Reddit", and
 * `\bdown\b` must not fire on "downside" (which carries its own entry).
 */
const DOUBT_WORDS = [
  "afraid",
  "anxious",
  "bear",
  "bearish",
  "bleeding",
  "bubble",
  "correction",
  "crash",
  "crashed",
  "crashing",
  "crisis",
  "dip",
  "dips",
  "dipping",
  "doubt",
  "doubts",
  "down",
  "downside",
  "downturn",
  "drop",
  "dropped",
  "dropping",
  "fear",
  "losing",
  "loss",
  "losses",
  "lost",
  "mistake",
  "nervous",
  "overvalued",
  "panic",
  "plummet",
  "plunge",
  "recession",
  "red",
  "regret",
  "scared",
  "sell",
  "selling",
  "sold",
  "slump",
  "tank",
  "tanked",
  "tanking",
  "tariff",
  "tariffs",
  "underwater",
  "worried",
  "worry",
  "worrying",
];

const DOUBT_RE = new RegExp(`\\b(${DOUBT_WORDS.join("|")})\\b`, "i");

/** True when the thread title names a drop, a dip, or a doubt. */
export function mentionsDoubt(post: RedditPost): boolean {
  return DOUBT_RE.test(post.title);
}

export interface MoodSplit {
  total: number;
  /** Titles matching the downside/doubt vocabulary — the bar's red share. */
  doubt: number;
  /** Everything the keyword pass did not flag — the bar's ink share. */
  rest: number;
  /** Doubt share, 0–100, rounded. */
  doubtPct: number;
  /** Ink share, 0–100 — always `100 - doubtPct` so the bar closes. */
  restPct: number;
}

/**
 * Split a feed into "mentions the downside" vs "everything else".
 *
 * Returns null under `minSample` titles: a ratio drawn from three posts is
 * noise dressed as a reading, and the module drops rather than fake one.
 */
export function moodSplit(
  posts: RedditPost[],
  minSample = 5
): MoodSplit | null {
  const total = posts.length;
  if (total < minSample) return null;

  const doubt = posts.reduce((n, p) => (mentionsDoubt(p) ? n + 1 : n), 0);
  const doubtPct = Math.round((doubt / total) * 100);

  return {
    total,
    doubt,
    rest: total - doubt,
    doubtPct,
    restPct: 100 - doubtPct,
  };
}
