import type { ArticleFrontmatter } from "@/lib/articles";
import LearnHero from "./LearnHero";
import FlagshipPromo from "./FlagshipPromo";
import PathsGrid from "./PathsGrid";
import EditorsPicks from "./EditorsPicks";
import Archive from "./Archive";
import NewsletterCard from "./NewsletterCard";

interface LearnContentProps {
  articles: ArticleFrontmatter[];
}

const FLAGSHIP_SLUG = "veqt-vs-xeqt";

/**
 * /learn V2 content composition.
 *
 * Page flow:
 *   LearnHero (compact masthead)
 *   FlagshipPromo (VEQT × XEQT — gravitational center)
 *   PathsGrid ("Where do I start?" — 3 of 6 paths with hover-reveal)
 *   EditorsPicks (Dispatch № framing)
 *   Archive (inline filters + 2-col magazine grid, URL-driven state)
 *   NewsletterCard (dark publication card)
 *
 * The flagship article is excluded from the Archive list so it doesn't
 * appear twice. URL filter state (?cat&diff&time&take&q&tag&more) lives
 * inside Archive.tsx for shareability.
 */
export default function LearnContent({ articles }: LearnContentProps) {
  // Exclude the flagship from the Archive list — it has its own hero slot.
  const archiveArticles = articles.filter((a) => a.slug !== FLAGSHIP_SLUG);

  return (
    <>
      <LearnHero articleCount={articles.length} />
      <FlagshipPromo />
      <PathsGrid articles={articles} />
      <EditorsPicks articles={articles} />
      <Archive articles={archiveArticles} />
      <NewsletterCard />
    </>
  );
}
