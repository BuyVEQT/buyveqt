import { renderBroadsheetOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/broadsheet";
import { getArticleBySlug, getArticleOrdinal } from "@/lib/articles";

// Node runtime: getArticleBySlug reads MDX from disk.
export const alt = "Learn Dispatch — BuyVEQT";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const CATEGORY_EYEBROW: Record<string, string> = {
  beginner: "The Basics",
  comparison: "Head to Head",
  "tax-strategy": "Tax & Accounts",
  "veqt-deep-dive": "The Deep Dive",
  opinion: "Opinion",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return renderBroadsheetOG({
      eyebrow: "The Archive",
      title: "Article not found.",
      alt,
    });
  }

  const ordinal = getArticleOrdinal(slug);
  const dispatchTag = ordinal
    ? `Dispatch No. ${String(ordinal).padStart(2, "0")}`
    : "Dispatch";
  const eyebrow =
    CATEGORY_EYEBROW[article.frontmatter.category ?? "beginner"] ??
    "The Archive";

  return renderBroadsheetOG({
    eyebrow,
    title: article.frontmatter.title,
    italic: article.frontmatter.isEditorial === true,
    dek: article.frontmatter.excerpt ?? article.frontmatter.description,
    footerNote: dispatchTag,
    alt: `${article.frontmatter.title} — BuyVEQT`,
  });
}
