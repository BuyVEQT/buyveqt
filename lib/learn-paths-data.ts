// Client-safe path data — no Node.js imports.
// Server-side slug validation lives in lib/learn-paths.ts.

export interface LearnPath {
  id: string;
  title: string;       // user-facing path name
  description: string; // 1-sentence hook
  slugs: string[];     // 4-6 article slugs in reading order
}

export const LEARN_PATHS: LearnPath[] = [
  {
    id: "new",
    title: "I'm new to this",
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
    title: "I'm comparing alternatives",
    description: "VEQT against XEQT, VFV, VGRO, DIY, robos, and cash.",
    slugs: [
      "veqt-vs-xeqt",
      "veqt-vs-vfv",
      "veqt-vs-vgro",
      "veqt-vs-diy-portfolio",
      "veqt-vs-robo-advisors",
      "veqt-vs-gics-hisa",
    ],
  },
  {
    id: "accounts",
    title: "I'm optimizing my accounts",
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
    title: "My VEQT is down",
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
    title: "I'm planning withdrawal",
    description: "Spending VEQT in retirement: order, taxes, sequence risk.",
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
    title: "Our Take — long-form essays",
    description: "Strong opinions on covered calls, forex, currency, and home bias.",
    slugs: [
      "covered-call-dividend-trap",
      "forex-vs-veqt",
      "veqt-canadian-home-bias",
      "veqt-currency-risk",
      "veqt-mer-true-cost",
    ],
  },
];
