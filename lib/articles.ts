import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface ArticleFrontmatter {
  title: string;
  description: string;
  slug: string;
  readingTime: string;
  lastUpdated: string;
  // Enriched fields (optional for backward compatibility)
  updatedDate?: string;
  excerpt?: string;
  category?: "beginner" | "veqt-deep-dive" | "comparison" | "opinion" | "tax-strategy";
  difficulty?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  relatedSlugs?: string[];
  isEditorial?: boolean;
  order?: number;
}

export interface ArticleData {
  frontmatter: ArticleFrontmatter;
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "learn");

/** Display order for the learn hub */
const ARTICLE_ORDER = [
  "veqt-decision-flowchart",
  "veqt-vs-xeqt",
  "what-is-veqt",
  "getting-started-with-veqt",
  "why-timing-the-market-fails",
  "veqt-distributions-explained",
  "veqt-vs-vgro",
  "veqt-vs-vfv",
  "veqt-is-down",
  "veqt-tfsa-rrsp-taxable",
  "veqt-in-your-fhsa",
  "automate-veqt-purchases",
  "veqt-mer-true-cost",
  "veqt-vs-diy-portfolio",
  "lump-sum-vs-dca",
  "veqt-currency-risk",
  "passive-investing-behavioral-edge",
  "veqt-vs-robo-advisors",
  "covered-call-dividend-trap",
  "forex-vs-veqt",
  "veqt-vs-gics-hisa",
  "why-stocks-go-up",
  "veqt-withdrawal-strategy",
  "veqt-canadian-home-bias",
  "veqt-asset-location",
];

function applyDefaults(data: Record<string, unknown>): ArticleFrontmatter {
  const fm = data as unknown as ArticleFrontmatter;
  return {
    ...fm,
    updatedDate: fm.updatedDate ?? fm.lastUpdated,
    excerpt: fm.excerpt ?? fm.description,
    category: fm.category ?? "beginner",
    difficulty: fm.difficulty ?? "beginner",
    tags: fm.tags ?? [],
    relatedSlugs: fm.relatedSlugs ?? [],
    isEditorial: fm.isEditorial ?? false,
    order: fm.order ?? 99,
  };
}

export function getAllArticles(): ArticleFrontmatter[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  const articles: ArticleFrontmatter[] = files.map((filename) => {
    const filePath = path.join(CONTENT_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);
    return applyDefaults(data);
  });

  // Sort by curated order
  return articles.sort((a, b) => {
    const aIndex = ARTICLE_ORDER.indexOf(a.slug);
    const bIndex = ARTICLE_ORDER.indexOf(b.slug);
    const aPos = aIndex === -1 ? 999 : aIndex;
    const bPos = bIndex === -1 ? 999 : bIndex;
    return aPos - bPos;
  });
}

export function getArticleBySlug(slug: string): ArticleData | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  return {
    frontmatter: applyDefaults(data),
    content,
  };
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(".mdx", ""));
}

/**
 * Return the article that follows `slug` in the global curated order,
 * plus the one that preceded it. Used by the end-of-article
 * "Continue to the next dispatch" CTA. Wraps from the last → first.
 */
export function getAdjacentArticles(slug: string): {
  previous: ArticleFrontmatter | null;
  next: ArticleFrontmatter | null;
} {
  const all = getAllArticles();
  const idx = all.findIndex((a) => a.slug === slug);
  if (idx === -1) return { previous: null, next: null };
  const previous = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;
  return { previous, next };
}

/**
 * Get the ordinal position (1-indexed) of an article in the curated
 * global sequence. Useful for "Dispatch No. 07" labelling on article heads.
 * Returns null if the article isn't in the ordered list.
 */
export function getArticleOrdinal(slug: string): number | null {
  const all = getAllArticles();
  const idx = all.findIndex((a) => a.slug === slug);
  return idx === -1 ? null : idx + 1;
}
