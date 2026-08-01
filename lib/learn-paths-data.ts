// Client-safe path data — no Node.js imports.

export interface LearnPath {
  id: string;
  /**
   * Question-style framing surfaced as the V2 path-card eyebrow.
   * Example: "I'm new to this." Falls back to `title` if absent.
   */
  question?: string;
  title: string; // user-facing path name
  description: string; // 1-sentence hook
  slugs: string[]; // 4-6 article slugs in reading order
}

export const LEARN_PATHS: LearnPath[] = [
  {
    id: "new",
    question: "I'm new to this.",
    title: "Start here.",
    description: "From 'what's an ETF' to your first share, in five steps.",
    slugs: [
      "veqt-decision-flowchart",
      "what-is-veqt",
      "getting-started-with-veqt",
      "why-timing-the-market-fails",
      "veqt-is-down",
    ],
  },
  {
    id: "comparing",
    question: "I'm comparing alternatives.",
    title: "Pick a fight.",
    description: "VEQT against XEQT, CAGE, VFV, VGRO, DIY, robos, and cash.",
    slugs: [
      "veqt-vs-xeqt",
      "veqt-vs-cage",
      "veqt-vs-vfv",
      "veqt-vs-vgro",
      "veqt-vs-diy-portfolio",
      "veqt-vs-robo-advisors",
      "veqt-vs-gics-hisa",
    ],
  },
  {
    id: "accounts",
    question: "I'm optimizing my accounts.",
    title: "Make the account work.",
    description: "TFSA, RRSP, FHSA, asset location, automation.",
    slugs: [
      "veqt-tfsa-rrsp-taxable",
      "veqt-in-your-fhsa",
      "veqt-asset-location",
      "automate-veqt-purchases",
      "veqt-distributions-explained",
    ],
  },
  {
    id: "down",
    question: "My VEQT is down.",
    title: "Read this first.",
    description: "Read this before you do anything.",
    slugs: [
      "veqt-is-down",
      "why-timing-the-market-fails",
      "why-stocks-go-up",
      "passive-investing-behavioral-edge",
      "lump-sum-vs-dca",
    ],
  },
  {
    id: "withdrawal",
    question: "I'm planning withdrawal.",
    title: "Spend it well.",
    description:
      "Spending VEQT in retirement: order, taxes, sequence risk.",
    slugs: [
      "veqt-withdrawal-strategy",
      "veqt-tfsa-rrsp-taxable",
      "veqt-asset-location",
      "veqt-vs-gics-hisa",
      "veqt-vs-vgro",
    ],
  },
  {
    id: "essays",
    question: "I want the long-form takes.",
    title: "Our Take — essays.",
    description:
      "Strong opinions on covered calls, forex, currency, and home bias.",
    slugs: [
      "covered-call-dividend-trap",
      "forex-vs-veqt",
      "veqt-canadian-home-bias",
      "veqt-currency-risk",
      "veqt-mer-true-cost",
    ],
  },
];

/**
 * Guard: every step above must name a real dispatch.
 *
 * The path pages render at build time (the index is static, the six detail
 * pages come from `generateStaticParams`), so calling this from them turns
 * a typo'd or renamed slug into a failed build rather than a path that
 * silently prints five steps where the data says six — `pickBySlug` drops
 * unresolved slugs by design, which is the right runtime behaviour but a
 * terrible way to find out.
 *
 * Takes the known slugs as an argument rather than reading the registry
 * itself: lib/articles touches `fs`, and this file stays client-safe.
 */
export function assertPathSlugsResolve(knownSlugs: Iterable<string>): void {
  const known = new Set(knownSlugs);
  const broken: string[] = [];

  for (const path of LEARN_PATHS) {
    for (const slug of path.slugs) {
      if (!known.has(slug)) broken.push(`${path.id} → ${slug}`);
    }
  }

  if (broken.length > 0) {
    throw new Error(
      `learn-paths-data: ${broken.length} path step(s) reference an article ` +
        `that does not exist in content/learn:\n  ${broken.join("\n  ")}`
    );
  }
}
