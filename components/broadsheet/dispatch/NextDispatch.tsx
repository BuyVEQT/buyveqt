import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";

interface NextDispatchProps {
  next: ArticleFrontmatter | null;
  previous?: ArticleFrontmatter | null;
}

/**
 * Prominent end-of-article CTA: "Continue to → [next dispatch]".
 *
 * Uses the global sequence from lib/articles ARTICLE_ORDER. If there's no
 * explicit next, component returns null so we never surface something
 * arbitrary. Previous is optional and rendered subtler when present.
 */
export default function NextDispatch({ next, previous }: NextDispatchProps) {
  if (!next && !previous) return null;

  return (
    <div className="mt-10 border-t-2 border-[var(--ink)] pt-6">
      {next && (
        <Link
          href={`/learn/${next.slug}`}
          className="group block"
          style={{ color: "var(--ink)" }}
        >
          <p className="bs-stamp mb-3">Continue to the next dispatch</p>
          <h3 className="bs-display-italic text-[1.75rem] sm:text-[2.25rem] leading-[1.05] group-hover:text-[var(--stamp)] transition-colors">
            {next.title}
          </h3>
          <p
            className="bs-caption mt-3 flex items-center flex-wrap gap-x-3 gap-y-1"
            style={{ color: "var(--ink-soft)" }}
          >
            <span>{next.readingTime}</span>
            {next.difficulty && (
              <>
                <span className="opacity-40">·</span>
                <span className="capitalize">{next.difficulty}</span>
              </>
            )}
            <span className="opacity-40">·</span>
            <span className="italic">{next.excerpt ?? next.description}</span>
          </p>
          <p className="bs-label mt-4 text-[var(--stamp)] group-hover:translate-x-1 transition-transform inline-block">
            Read it &rarr;
          </p>
        </Link>
      )}

      {previous && (
        <p className="bs-caption italic mt-6 pt-4 border-t border-[var(--color-border)]">
          &larr; Previously:{" "}
          <Link
            href={`/learn/${previous.slug}`}
            className="bs-link"
            style={{ color: "var(--ink)" }}
          >
            {previous.title}
          </Link>
        </p>
      )}
    </div>
  );
}
