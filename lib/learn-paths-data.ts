// Client-safe path data — no Node.js imports.
// Server-side slug validation lives in lib/learn-paths.ts.

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
