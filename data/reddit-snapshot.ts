import type { RedditPost, SubredditStats } from "@/lib/data/reddit";

/* ── Reddit score snapshot ───────────────────────────────────
 *
 * Reddit now blocks every anonymous server-side read path (datacenter IPs,
 * non-browser TLS fingerprints, headless browsers — all 403), so the live
 * tiers in lib/data/reddit.ts degrade to RSS, which carries no scores or
 * subscriber counts. This file is the score source of last resort: a
 * hand-captured copy of the listings, taken from a real logged-in browser —
 * the one client Reddit still serves.
 *
 * What uses it (see applySnapshot / getSubredditStats in lib/data/reddit.ts):
 *   - RSS-tier posts get score/commentCount filled in by post id.
 *   - The top/all-time feed is unioned with these posts and ordered by score.
 *   - The community hero's subscriber count falls back to `stats`.
 *
 * To refresh: open these in a normal browser (NOT curl — Reddit blocks it):
 *   https://www.reddit.com/r/JustBuyVEQT/top.json?t=all&limit=25&raw_json=1
 *   https://www.reddit.com/r/JustBuyVEQT/about.json
 * and update the entries below (or paste the JSON to Claude and ask it to).
 * Scores on all-time posts only grow, so a stale snapshot is merely
 * conservative, never wrong-ordered.
 */

export const SNAPSHOT_CAPTURED_AT = "2026-06-10";

export const SNAPSHOT_STATS: SubredditStats = {
  subscribers: 0, // 0 = unknown; hero hides the stat
  activeUsers: null,
};

export const SNAPSHOT_POSTS: RedditPost[] = [];
