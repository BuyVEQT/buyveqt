import { getAllArticles, type ArticleFrontmatter } from "@/lib/articles";
import SectionLabel from "@/components/ui/SectionLabel";
import ArticleRow from "./ArticleRow";

interface RelatedArticlesProps {
  /** Current article's slug — excluded from the pick list. */
  currentSlug: string;
  /** Optional explicit slugs (from frontmatter.relatedSlugs). */
  relatedSlugs?: string[];
  /** Category fallback when explicit slugs run out. */
  category?: string;
}

/**
 * Round 4 v2 — "Also worth reading" strip at the bottom of the
 * article reader. Two compact ArticleRows picked from:
 *   1. explicit relatedSlugs (front-matter),
 *   2. same-category articles,
 *   3. anything (last-resort fill).
 */
export default function RelatedArticles({
  currentSlug,
  relatedSlugs = [],
  category,
}: RelatedArticlesProps) {
  const all = getAllArticles();
  let picks: ArticleFrontmatter[] = [];

  if (relatedSlugs.length > 0) {
    picks = relatedSlugs
      .map((s) => all.find((a) => a.slug === s))
      .filter((a): a is ArticleFrontmatter => !!a && a.slug !== currentSlug)
      .slice(0, 2);
  }

  if (picks.length < 2 && category) {
    const same = all
      .filter((a) => a.slug !== currentSlug && a.category === category)
      .filter((a) => !picks.some((p) => p.slug === a.slug))
      .slice(0, 2 - picks.length);
    picks = [...picks, ...same];
  }

  if (picks.length < 2) {
    const fill = all
      .filter((a) => a.slug !== currentSlug)
      .filter((a) => !picks.some((p) => p.slug === a.slug))
      .slice(0, 2 - picks.length);
    picks = [...picks, ...fill];
  }

  if (picks.length === 0) return null;

  return (
    <section style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--rule-soft)" }}>
      <SectionLabel style={{ marginBottom: 6 }}>Also worth reading</SectionLabel>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {picks.map((a) => (
          <ArticleRow key={a.slug} article={a} compact />
        ))}
      </ul>
    </section>
  );
}
