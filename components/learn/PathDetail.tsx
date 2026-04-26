import Link from "next/link";
import type { LearnPath } from "@/lib/learn-paths-data";
import { LEARN_PATHS } from "@/lib/learn-paths-data";
import type { ArticleFrontmatter } from "@/lib/articles";

interface PathDetailProps {
  path: LearnPath;
  articles: ArticleFrontmatter[];
}

export default function PathDetail({ path, articles }: PathDetailProps) {
  const pathArticles = path.slugs
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is ArticleFrontmatter => !!a);

  const firstArticle = pathArticles[0] ?? null;

  const otherPaths = LEARN_PATHS.filter((p) => p.id !== path.id);

  return (
    <article>
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 pt-8 pb-4 bs-caption"
        style={{ color: "var(--ink-soft)" }}
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="bs-link hover:text-[var(--stamp)] transition-colors"
        >
          Home
        </Link>
        <span aria-hidden="true">&middot;</span>
        <Link
          href="/learn"
          className="bs-link hover:text-[var(--stamp)] transition-colors"
        >
          Learn
        </Link>
        <span aria-hidden="true">&middot;</span>
        <span style={{ color: "var(--ink)" }}>{path.title}</span>
      </nav>

      {/* Header */}
      <header className="pb-6 border-b border-[var(--color-border)]">
        <p className="bs-stamp mb-3">The Path</p>
        <h1
          className="bs-display text-[2.25rem] sm:text-[3rem] lg:text-[3.75rem] leading-[0.95]"
          style={{ color: "var(--ink)" }}
        >
          {path.title}.
        </h1>
        <p
          className="bs-body italic mt-3 max-w-[54ch] text-[1rem] sm:text-[1.0625rem]"
          style={{ color: "var(--ink-soft)" }}
        >
          {path.description}
        </p>
      </header>

      {/* Numbered article list */}
      <section className="mt-6 mb-10">
        <ol>
          {pathArticles.map((article, i) => (
            <li key={article.slug}>
              <Link
                href={`/learn/${article.slug}`}
                className="group flex items-baseline justify-between gap-4 py-4 border-b border-[var(--color-border)] hover:border-[var(--stamp)] transition-colors"
              >
                <div className="flex items-baseline gap-4 flex-1 min-w-0">
                  <span
                    className="bs-numerals tabular-nums shrink-0 text-[0.875rem]"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h2
                      className="bs-body font-medium text-[1rem] leading-[1.3] group-hover:text-[var(--stamp)] transition-colors"
                      style={{ color: "var(--ink)" }}
                    >
                      {article.title}
                    </h2>
                    {(article.excerpt || article.description) && (
                      <p
                        className="bs-caption text-[0.875rem] mt-0.5 leading-[1.45]"
                        style={{ color: "var(--ink-soft)" }}
                      >
                        {article.excerpt || article.description}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className="bs-caption shrink-0 text-[0.75rem]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {article.readingTime} &nbsp;&rarr;
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      {firstArticle && (
        <div className="mb-12 pb-8 border-b border-[var(--color-border)]">
          <Link
            href={`/learn/${firstArticle.slug}`}
            className="bs-link inline-flex items-center gap-2 text-[1rem] font-medium hover:text-[var(--stamp)] transition-colors"
            style={{ color: "var(--ink)" }}
          >
            Start the path &rarr;
          </Link>
        </div>
      )}

      {/* Other paths */}
      {otherPaths.length > 0 && (
        <aside className="mb-12">
          <p
            className="bs-stamp mb-4"
            style={{ color: "var(--ink-soft)" }}
          >
            Other paths
          </p>
          <ul className="flex flex-col gap-2">
            {otherPaths.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/learn/path/${p.id}`}
                  className="group flex items-baseline justify-between gap-4 py-2 border-t border-[var(--color-border)]"
                >
                  <span
                    className="bs-body text-[0.9375rem] group-hover:text-[var(--stamp)] transition-colors"
                    style={{ color: "var(--ink)" }}
                  >
                    {p.title}
                  </span>
                  <span
                    className="bs-caption text-[0.8125rem] shrink-0"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {p.slugs.length} articles &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}
