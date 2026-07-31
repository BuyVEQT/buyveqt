import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleBySlug,
  getAllSlugs,
  getAllArticles,
  getAdjacentArticles,
  getArticleOrdinal,
} from "@/lib/articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl, SITE_NAME } from "@/lib/seo-config";
import { ArticleProvider } from "@/components/learn/ArticleContext";
import ArticleMeta from "@/components/learn/ArticleMeta";
import ArticleHeader from "@/components/learn/ArticleHeader";
import ArticleBody from "@/components/learn/ArticleBody";
import TaleOfTheTape from "@/components/learn/TaleOfTheTape";
import TheTape from "@/components/learn/TheTape";
import VerdictCallout from "@/components/learn/VerdictCallout";
import RelatedArticles from "@/components/learn/RelatedArticles";
import ReadingProgress from "@/components/learn/ReadingProgress";
import NextDispatch from "@/components/learn/NextDispatch";
import NewsletterCard from "@/components/learn/NewsletterCard";
import SeverityMeterAuto from "@/components/broadsheet/SeverityMeterAuto";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };

  const url = canonicalUrl(`/learn/${slug}`);
  const description =
    article.frontmatter.excerpt ||
    article.frontmatter.description ||
    `Learn about ${article.frontmatter.title} — a guide for Canadian passive investors.`;

  return {
    title: article.frontmatter.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.frontmatter.title,
      description,
      url,
      publishedTime: article.frontmatter.lastUpdated,
      modifiedTime:
        article.frontmatter.updatedDate || article.frontmatter.lastUpdated,
      authors: ["BuyVEQT"],
      section: "Education",
    },
  };
}

const CATEGORY_LABEL: Record<string, string> = {
  beginner: "The Basics",
  comparison: "Head-to-Head",
  "tax-strategy": "Tax & Accounts",
  "veqt-deep-dive": "The Deep Dive",
  opinion: "Opinion",
};

/** The one article that gets the tale-of-the-tape hero and the score rail. */
const MARQUEE_SLUG = "veqt-vs-xeqt";

const MARQUEE_DECK = "What's the difference — and which should you buy?";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "12 min read" → 12. Returns 0 when the frontmatter doesn't say. */
function parseMinutes(readingTime: string): number {
  const m = /(\d+)/.exec(readingTime ?? "");
  return m ? Number(m[1]) : 0;
}

const css = `
.artc {
  background: var(--ins-paper);
  color: var(--ins-ink);
  font-family: var(--ins-font);
  min-height: 100dvh;
}
.artc__page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 48px;
}

/* ══ The reading grid ═══════════════════════════════════════════════
 * One DOM node per block, repositioned by grid placement rather than
 * duplicated behind media queries. This is the fix for the flagged bug:
 * the verdict used to render twice (inline for mobile, again in the
 * sidecar for desktop, toggled with display:none) and the sidecar shipped
 * a second, scraped table of contents alongside the MDX one.
 *
 * Mobile stacks tape → body → verdict. Desktop puts the body in a tall
 * left column with the tape and verdict stacked in the right rail; the
 * third "pad" row soaks up the body's extra height so the two rail items
 * keep their natural size at the top of the column.
 * ═════════════════════════════════════════════════════════════════ */
.artc__grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    "tape"
    "body"
    "verdict";
  gap: 26px;
}
.artc__tape {
  grid-area: tape;
}
.artc__body {
  grid-area: body;
  min-width: 0;
  /* Neutralises the legacy .flagship-bleed widgets a few other articles
     still use — the body column is already the full measure now. */
  --bleed-x: 0px;
}
.artc__verdict {
  grid-area: verdict;
}
@media (min-width: 1024px) {
  .artc__grid {
    grid-template-columns: minmax(0, 1fr) 320px;
    grid-template-areas:
      "body tape"
      "body verdict"
      "body pad";
    grid-template-rows: auto auto 1fr;
    column-gap: 52px;
    row-gap: 28px;
  }
  .artc__tape,
  .artc__verdict {
    align-self: start;
  }
  /* The tape is the pinned one — "the score is always on screen". With no
     tape the verdict takes the pin instead, so the rail is never a lone
     block stranded at the top of a long scroll. */
  .artc__tape {
    position: sticky;
    top: 92px;
  }
  .artc__grid--notape .artc__verdict {
    position: sticky;
    top: 92px;
  }
}

.artc__severity {
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--ins-hair);
}

/* ══ Article grammar ════════════════════════════════════════════════
 * The artboard sets the whole screen in Archivo and never reaches for a
 * serif, so the prose is Archivo too. Block selectors are direct-child
 * only: MDX components (verdict panel, callouts, exhibits) carry their own
 * type and must not inherit the prose measure or colour.
 * ═════════════════════════════════════════════════════════════════ */
.artc__prose {
  counter-reset: artc-sec;
  font-size: 21px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--ins-ink);
}
.artc__prose > p,
.artc__prose > ul,
.artc__prose > ol,
.artc__prose > blockquote {
  max-width: 68ch;
}
.artc__prose > p {
  margin: 0 0 20px;
  text-wrap: pretty;
}
.artc__prose > *:first-child {
  margin-top: 0;
}

/* h2 opens a section: 3px ink rule, auto-numbered red kicker, display
   title — the same three moves /methodology makes on its notes. */
.artc__prose > h2 {
  margin: 46px 0 16px;
  padding-top: 14px;
  border-top: 3px solid var(--ins-rule-strong);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.12;
  color: var(--ins-ink);
  scroll-margin-top: 96px;
}
.artc__prose > h2::before {
  counter-increment: artc-sec;
  content: "Section " counter(artc-sec, decimal-leading-zero);
  display: block;
  margin-bottom: 8px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-signal);
  font-variant-numeric: tabular-nums;
}
.artc__prose > h3 {
  margin: 30px 0 10px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 1.2;
  color: var(--ins-ink);
}
.artc__prose > p strong,
.artc__prose > ul strong,
.artc__prose > ol strong {
  font-weight: 700;
  color: var(--ins-ink);
}
.artc__prose > p a,
.artc__prose > ul a,
.artc__prose > ol a,
.artc__prose > blockquote a {
  color: var(--ins-ink);
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
.artc__prose > p a:hover,
.artc__prose > ul a:hover,
.artc__prose > ol a:hover,
.artc__prose > blockquote a:hover {
  color: var(--ins-signal);
}

/* Top-level bullets become ruled rows; nested lists keep their markers. */
.artc__prose > ul {
  list-style: none;
  margin: 0 0 22px;
  padding: 0;
}
.artc__prose > ul > li {
  padding: 13px 0;
  border-top: 1px solid var(--ins-hair);
}
.artc__prose > ul > li:last-child {
  border-bottom: 1px solid var(--ins-hair);
}
.artc__prose > ol {
  margin: 0 0 22px 1.3em;
  padding: 0;
}
.artc__prose > ol > li {
  padding: 6px 0;
}
.artc__prose > blockquote {
  margin: 24px 0;
  padding: 2px 0 2px 18px;
  border-left: 3px solid var(--ins-ink);
  color: var(--ins-gray-700);
}
.artc__prose > blockquote p:last-child {
  margin-bottom: 0;
}
.artc__prose > hr {
  margin: 34px 0;
  border: 0;
  border-top: 1px solid var(--ins-ink);
}
.artc__prose code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.78em;
  padding: 2px 6px;
  border: 1px solid var(--ins-hair);
}
.artc__prose > pre {
  margin: 24px 0;
  padding: 16px 18px;
  border: 1px solid var(--ins-ink);
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.55;
}
.artc__prose > pre code {
  border: 0;
  padding: 0;
}

/* Markdown tables — the same ruled grammar as <ComparisonTable>. */
.artc__prose > table {
  width: 100%;
  margin: 26px 0;
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  font-variant-numeric: tabular-nums;
}
.artc__prose > table th {
  padding: 10px 14px 9px;
  text-align: left;
  white-space: nowrap;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  border-bottom: 1px solid var(--ins-ink);
}
.artc__prose > table td {
  padding: 11px 14px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;
  color: var(--ins-gray-700);
  border-bottom: 1px solid var(--ins-hair);
}
.artc__prose > table td strong {
  color: var(--ins-ink);
  font-weight: 700;
}

/* ══ Closer chain ══════════════════════════════════════════════════ */
.artc__closer {
  margin-top: 40px;
}
.artc__colophon {
  margin-top: 30px;
  padding: 22px 0 0;
  border-top: 1px solid var(--ins-ink);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
  flex-wrap: wrap;
}
.artc__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.artc__tag {
  color: var(--ins-gray-600);
  text-decoration: none;
}
.artc__tag:hover {
  color: var(--ins-signal);
}
.artc__position {
  margin-left: auto;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  text-align: right;
}

/* ══ Mobile · 390 ══════════════════════════════════════════════════ */
@media (max-width: 640px) {
  .artc__page {
    padding: 0 20px 32px;
  }
  .artc__grid {
    margin-top: 18px;
    gap: 20px;
  }
  .artc__prose {
    font-size: 17px;
    line-height: 1.62;
  }
  .artc__prose > p {
    margin-bottom: 16px;
  }
  .artc__prose > h2 {
    margin: 32px 0 12px;
    padding-top: 12px;
    font-size: 22px;
    letter-spacing: -0.02em;
  }
  .artc__prose > h2::before {
    font-size: 8.5px;
    letter-spacing: 0.18em;
  }
  .artc__prose > h3 {
    font-size: 17px;
  }
  .artc__prose > ul > li {
    padding: 11px 0;
  }
  .artc__prose > table td {
    padding: 9px 11px;
    font-size: 13px;
  }
  .artc__closer {
    margin-top: 30px;
  }
  .artc__colophon {
    gap: 12px;
  }
  .artc__tags {
    font-size: 8px;
    letter-spacing: 0.12em;
  }
  .artc__position {
    margin-left: 0;
    text-align: left;
    font-size: 8.5px;
    letter-spacing: 0.12em;
  }
}
`;

/**
 * The dispatch reader — /learn/[slug] in the Instrument grammar (Turn 7).
 *
 * Composition:
 *   tape        — <ReadingProgress>, fixed under the shell masthead
 *   dateline    — <ArticleMeta>, live percent + minutes left
 *   head        — <TaleOfTheTape> on the flagship, <ArticleHeader> elsewhere
 *   grid        — body column + right rail (score tape, verdict)
 *   closer      — next dispatch · related · newsletter · colophon
 *
 * Server component: the CSS ships as a plain <style> tag rather than
 * styled-jsx, which would force "use client" and drop its scope class off
 * <Link> and everything MDX renders. Only the four pieces that need the
 * scroll position or an IntersectionObserver are client components, and
 * they share one listener through <ArticleProvider>.
 */
export default async function LearnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const { frontmatter, content } = article;
  const { next, previous } = getAdjacentArticles(slug);

  const isMarquee = slug === MARQUEE_SLUG;
  const editorial = frontmatter.isEditorial === true;
  const tags = (frontmatter.tags ?? []).filter(Boolean).slice(0, 6);

  /**
   * Build once. The verdict is a single node — the grid moves it between the
   * desktop rail and the mobile flow rather than rendering one of each. It's
   * suppressed entirely when the MDX already closes on a <VerdictCard>,
   * which is what would otherwise put two verdicts on the flagship.
   */
  const mdxClosesOnVerdict = content.includes("<VerdictCard");
  const verdict =
    editorial && !mdxClosesOnVerdict ? (
      <VerdictCallout headline="Our verdict, in one line.">
        {frontmatter.excerpt ?? frontmatter.description}
      </VerdictCallout>
    ) : null;

  const meta = {
    slug,
    category:
      CATEGORY_LABEL[frontmatter.category ?? "beginner"] ?? "The Archive",
    ordinal: getArticleOrdinal(slug),
    total: getAllArticles().length,
    minutes: parseMinutes(frontmatter.readingTime),
  };

  return (
    <main className="artc ins-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
          { name: frontmatter.title, path: `/learn/${slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: frontmatter.title,
          description: frontmatter.excerpt || frontmatter.description,
          datePublished: frontmatter.lastUpdated,
          dateModified: frontmatter.updatedDate || frontmatter.lastUpdated,
          author: { "@type": "Organization", name: SITE_NAME },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: canonicalUrl(),
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl(`/learn/${slug}`),
          },
        }}
      />

      <ArticleProvider meta={meta}>
        <ReadingProgress />

        <div className="artc__page">
          <ArticleMeta />

          {isMarquee ? (
            <TaleOfTheTape
              deck={MARQUEE_DECK}
              updated={formatDate(
                frontmatter.updatedDate ?? frontmatter.lastUpdated
              )}
              readingTime={frontmatter.readingTime}
              editorial={editorial}
            />
          ) : (
            <ArticleHeader frontmatter={frontmatter} />
          )}

          <div className={`artc__grid${isMarquee ? "" : " artc__grid--notape"}`}>
            {isMarquee && (
              <div className="artc__tape">
                <TheTape />
              </div>
            )}

            <div className="artc__body">
              {/* Inline severity reading on the panic-landing article. */}
              {slug === "veqt-is-down" && (
                <div className="artc__severity">
                  <SeverityMeterAuto compact />
                </div>
              )}
              <ArticleBody content={content} />
            </div>

            {verdict && <div className="artc__verdict">{verdict}</div>}
          </div>

          <div className="artc__closer">
            <NextDispatch next={next} previous={previous} />

            <RelatedArticles
              currentSlug={slug}
              relatedSlugs={frontmatter.relatedSlugs}
              category={frontmatter.category}
            />

            <NewsletterCard compact />

            <div className="artc__colophon">
              {tags.length > 0 && (
                <div className="artc__tags">
                  {tags.map((t, i) => (
                    <span key={t}>
                      {i > 0 && <span aria-hidden>· </span>}
                      <Link
                        className="artc__tag"
                        href={`/learn?tag=${encodeURIComponent(t)}`}
                      >
                        #{t}
                      </Link>
                    </span>
                  ))}
                </div>
              )}
              {editorial && (
                <div className="artc__position">
                  Editorial position of BuyVEQT.ca · Not financial advice
                </div>
              )}
            </div>
          </div>
        </div>
      </ArticleProvider>
    </main>
  );
}
