import type { ArticleFrontmatter } from "@/lib/articles";

/**
 * Syllabus derivation for the /learn index (Instrument reskin, artboard 6c).
 *
 * The index prints five reading buckets — Foundation / Strategy / Behaviour /
 * Tax / Mechanics — which are a *display* taxonomy layered over the registry's
 * internal `category` + canonical tags. Nothing here invents content: every
 * title, slug, reading time and count comes from lib/articles.
 *
 * Client-safe (no `fs`) so the filter tabs can import it.
 */

export const LEARN_CATEGORIES = [
  "Foundation",
  "Strategy",
  "Behaviour",
  "Tax",
  "Mechanics",
] as const;

export type LearnCategory = (typeof LEARN_CATEGORIES)[number];

/** The marquee bout — the one read most people arrive for. */
export const MARQUEE_SLUG = "veqt-vs-xeqt";

/**
 * Course One — verbatim the home page's reading order
 * (components/home/ArticleStrip.tsx). Kept in slug form so the two
 * surfaces can never drift on *which* articles they mean.
 */
export const COURSE_ONE_SLUGS = [
  "what-is-veqt",
  "veqt-vs-diy-portfolio",
  "veqt-is-down",
];

/** Course Two — the accounts. First three of the "accounts" learn path. */
export const COURSE_TWO_SLUGS = [
  "veqt-tfsa-rrsp-taxable",
  "veqt-distributions-explained",
  "automate-veqt-purchases",
];

/** Rows the full index prints before the archive expander. */
export const INDEX_PREVIEW_COUNT = 8;

/**
 * Registry category (+ a single tag refinement) → reading bucket.
 *
 * The tag check runs first so `veqt-is-down` — a `veqt-deep-dive` about not
 * panicking — prints as Behaviour, matching the kicker the home page's
 * reading order already shows for it.
 */
export function categoryOf(a: ArticleFrontmatter): LearnCategory {
  const tags = a.tags ?? [];
  if (tags.includes("psychology") || tags.includes("behavior")) {
    return "Behaviour";
  }
  switch (a.category) {
    case "tax-strategy":
      return "Tax";
    case "comparison":
      return "Strategy";
    case "opinion":
      return "Behaviour";
    case "veqt-deep-dive":
      return "Mechanics";
    default:
      return "Foundation";
  }
}

/** "6 min read" → 6. Returns 0 when the frontmatter has no number. */
export function minutesOf(a: ArticleFrontmatter): number {
  const m = a.readingTime?.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export interface SyllabusEntry {
  slug: string;
  title: string;
  category: LearnCategory;
  minutes: number;
}

export function toEntry(a: ArticleFrontmatter): SyllabusEntry {
  return {
    slug: a.slug,
    title: a.title,
    category: categoryOf(a),
    minutes: minutesOf(a),
  };
}

/**
 * Resolve a hand-curated slug list against the registry, preserving the
 * given order. Slugs that no longer exist drop out rather than rendering
 * a dead link — the ordinals renumber around the gap.
 */
export function pickBySlug(
  articles: ArticleFrontmatter[],
  slugs: string[]
): SyllabusEntry[] {
  const bySlug = new Map(
    articles.map((a): [string, ArticleFrontmatter] => [a.slug, a])
  );
  return slugs
    .map((s) => bySlug.get(s))
    .filter((a): a is ArticleFrontmatter => Boolean(a))
    .map(toEntry);
}

export function totalMinutes(entries: SyllabusEntry[]): number {
  return entries.reduce((sum, e) => sum + e.minutes, 0);
}

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy",
  "eighty", "ninety",
];

/**
 * 26 → "twenty-six". The index spells its counts ("All twenty-six.",
 * "Sixteen minutes to literacy.") so they have to track the real registry
 * rather than sit in the copy as literals. Falls back to digits outside 0–99.
 */
export function numberWord(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);
  if (n < 20) return ONES[n];
  const tens = TENS[Math.floor(n / 10)];
  const ones = n % 10;
  return ones === 0 ? tens : `${tens}-${ONES[ones]}`;
}

/** "twenty-six" → "Twenty-six" (sentence starts). */
export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
