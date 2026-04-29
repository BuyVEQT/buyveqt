/**
 * Three named courses — the editorial syllabus that anchors both the
 * home page (Course 1 only, as a Step 1/2/3 strip) and `/learn` (all
 * three side-by-side).
 *
 * Slug substitution: the design brief uses placeholder slugs
 * (`anatomy-of-veqt`, `13000-companies`, `why-not-stockpicking`,
 * `the-couch-potato`, `rebalance-or-not`, `history-of-drawdowns`,
 * `the-discipline`) that don't exist in `content/learn/`. To avoid
 * dead links, each missing slot is filled with the closest existing
 * article that occupies the same editorial role. The substitutions
 * are listed in `audit.md`.
 */
export interface CourseArticle {
  step: number;
  /** Slug under `content/learn/`. Must resolve. */
  slug: string;
  /** Display title for the card (may differ from the article's own title). */
  title: string;
}

export interface Course {
  number: number;
  title: string;
  blurb: string;
  articles: CourseArticle[];
}

export const COURSES: Course[] = [
  {
    number: 1,
    title: "What VEQT actually is",
    blurb:
      "The one-paragraph version, the underlying funds, and how to actually buy it.",
    articles: [
      {
        step: 1,
        slug: "what-is-veqt",
        title: "What VEQT is, in one paragraph",
      },
      {
        step: 2,
        slug: "veqt-canadian-home-bias",
        title: "What's inside, and the Canadian tilt",
      },
      {
        step: 3,
        slug: "getting-started-with-veqt",
        title: "Buying it, in plain English",
      },
    ],
  },
  {
    number: 2,
    title: "Why one fund and hold forever",
    blurb: "The argument for radical simplicity, in three reads.",
    articles: [
      {
        step: 1,
        slug: "why-timing-the-market-fails",
        title: "Why not just pick the bottom",
      },
      {
        step: 2,
        slug: "veqt-vs-diy-portfolio",
        title: "One fund vs the five-ETF portfolio",
      },
      {
        step: 3,
        slug: "automate-veqt-purchases",
        title: "What hold-forever actually looks like",
      },
    ],
  },
  {
    number: 3,
    title: "What to do when it's down",
    blurb: "The hardest part of the discipline, broken into three reads.",
    articles: [
      {
        step: 1,
        slug: "veqt-is-down",
        title: "When the market is in red — read first",
      },
      {
        step: 2,
        slug: "why-stocks-go-up",
        title: "Why drawdowns are the price of returns",
      },
      {
        step: 3,
        slug: "passive-investing-behavioral-edge",
        title: "The discipline that makes hold-forever work",
      },
    ],
  },
];
