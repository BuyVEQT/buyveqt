import { renderInstrumentOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og/instrument";
import { getArticleBySlug, getArticleOrdinal } from "@/lib/articles";

// Node runtime: getArticleBySlug reads MDX from disk.
export const alt = "Learn Dispatch — BuyVEQT";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const CATEGORY_EYEBROW: Record<string, string> = {
  beginner: "THE BASICS",
  comparison: "HEAD TO HEAD",
  "tax-strategy": "TAX & ACCOUNTS",
  "veqt-deep-dive": "THE DEEP DIVE",
  opinion: "OPINION",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return renderInstrumentOG({
      eyebrow: "THE ARCHIVE",
      titleLines: ["Article", "not found."],
      chipLabel: "THE ARCHIVE",
      chipMark: false,
      alt,
    });
  }

  const ordinal = getArticleOrdinal(slug);
  const dispatchTag = ordinal
    ? `DISPATCH NO. ${String(ordinal).padStart(2, "0")}`
    : "DISPATCH";
  const eyebrow =
    CATEGORY_EYEBROW[article.frontmatter.category ?? "beginner"] ??
    "THE ARCHIVE";

  return renderInstrumentOG({
    eyebrow,
    title: article.frontmatter.title,
    dek: article.frontmatter.excerpt ?? article.frontmatter.description,
    chipLabel: dispatchTag,
    chipMark: false,
    statLabel: article.frontmatter.readingTime?.toUpperCase(),
    alt: `${article.frontmatter.title} — BuyVEQT`,
  });
}
