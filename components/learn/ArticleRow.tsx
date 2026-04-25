"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ArticleFrontmatter } from "@/lib/articles";
import { isInteractive } from "@/lib/interactive-slugs";

interface ArticleRowProps {
  article: ArticleFrontmatter;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function ArticleRow({ article }: ArticleRowProps) {
  const router = useRouter();
  const params = useSearchParams();
  const interactive = isInteractive(article.slug);
  const editorial = article.isEditorial === true;

  const variant: "editorial" | "interactive" | "default" = editorial
    ? "editorial"
    : interactive
    ? "interactive"
    : "default";

  const tags = (article.tags ?? []).slice(0, 3);

  function handleTagClick(tag: string) {
    const next = new URLSearchParams();
    next.set("tag", tag);
    router.replace(`/learn?${next.toString()}`, { scroll: false });
  }

  return (
    <li
      className={
        variant === "editorial" ? "border-l-2 ml-3 pl-3" : undefined
      }
      style={
        variant === "editorial" ? { borderColor: "var(--stamp)" } : undefined
      }
    >
      <div className="py-4 sm:py-5 border-t border-[var(--color-border)]">
        {variant === "editorial" && (
          <p
            className="bs-stamp mb-1"
            style={{ fontSize: "10px", color: "var(--stamp)" }}
          >
            Our Take
          </p>
        )}
        <Link
          href={`/learn/${article.slug}`}
          className="group block"
        >
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3
                className="bs-display-italic text-[1.125rem] sm:text-[1.375rem] leading-[1.2] group-hover:text-[var(--stamp)] transition-colors"
                style={{ color: "var(--ink)" }}
              >
                {article.title}
              </h3>
              {interactive && (
                <span
                  className="bs-stamp shrink-0 mt-0.5"
                  style={{
                    fontSize: "9px",
                    color: "var(--stamp)",
                    border: "1px solid var(--stamp)",
                    padding: "1px 4px",
                    lineHeight: "1.4",
                    whiteSpace: "nowrap",
                  }}
                >
                  Tool
                </span>
              )}
            </div>
            <p
              className="bs-caption mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1"
              style={{ color: "var(--ink-soft)" }}
            >
              <span>{article.readingTime}</span>
              {article.difficulty && article.difficulty !== "beginner" && (
                <>
                  <span className="opacity-40">·</span>
                  <span>{DIFFICULTY_LABEL[article.difficulty]}</span>
                </>
              )}
            </p>
            {(article.excerpt || article.description) && (
              <p
                className="bs-body text-[0.95rem] mt-2 leading-[1.45] max-w-[60ch]"
                style={{ color: "var(--ink)" }}
              >
                {article.excerpt || article.description}
              </p>
            )}
          </div>
        </Link>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="bs-caption"
                style={{
                  color: "var(--ink-soft)",
                  fontSize: "11px",
                  border: "1px solid var(--color-border)",
                  padding: "1px 6px",
                  borderRadius: "2px",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
