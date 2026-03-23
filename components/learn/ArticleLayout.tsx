import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ArticleFrontmatter } from "@/lib/articles";

interface ArticleLayoutProps {
  frontmatter: ArticleFrontmatter;
  content: string;
}

export default function ArticleLayout({ frontmatter, content }: ArticleLayoutProps) {
  return (
    <article className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--color-text-muted)] mb-6">
        <Link
          href="/learn"
          className="hover:text-[var(--color-text-primary)] transition-colors"
        >
          Learn
        </Link>
        <span className="mx-2">→</span>
        <span className="text-[var(--color-text-secondary)]">{frontmatter.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] leading-tight">
          {frontmatter.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {frontmatter.readingTime} · Last updated {frontmatter.lastUpdated}
        </p>
      </header>

      {/* MDX Content */}
      <div className="prose-custom">
        <MDXRemote source={content} />
      </div>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
        <Link
          href="/learn"
          className="text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
        >
          &larr; Back to all articles
        </Link>

        <div className="mt-6 rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            This is educational content, not financial advice. Consider your
            personal situation and consult a qualified advisor before making
            investment decisions.
          </p>
        </div>
      </div>
    </article>
  );
}
