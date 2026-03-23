import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface ArticleFrontmatter {
  title: string;
  description: string;
  slug: string;
  readingTime: string;
  lastUpdated: string;
}

export interface ArticleData {
  frontmatter: ArticleFrontmatter;
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "learn");

/** Display order for the learn hub */
const ARTICLE_ORDER = [
  "what-is-veqt",
  "what-you-actually-own",
  "veqt-vs-xeqt",
  "veqt-vs-vgro",
  "veqt-in-tfsa-vs-rrsp-vs-non-registered",
  "how-veqt-rebalances",
];

export function getAllArticles(): ArticleFrontmatter[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  const articles: ArticleFrontmatter[] = files.map((filename) => {
    const filePath = path.join(CONTENT_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);
    return data as ArticleFrontmatter;
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
    frontmatter: data as ArticleFrontmatter,
    content,
  };
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(".mdx", ""));
}
