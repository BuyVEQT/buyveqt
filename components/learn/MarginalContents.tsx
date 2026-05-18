"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SectionLabel from "@/components/ui/SectionLabel";

interface MarginalContentsProps {
  /** Optional verdict callout rendered above the TOC (or null). */
  verdict?: React.ReactNode;
  /** Article tags rendered in their own card at the bottom. */
  tags?: string[];
}

interface Heading {
  id: string;
  text: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Round 4 v2 — desktop reader sidecar (xl+). Three stacked cards:
 *   1. <VerdictCallout> (Card dark) — shown when the article is editorial.
 *   2. "Article contents" TOC — h2 anchors, active one gets vermilion left rule.
 *   3. "Tags" card — clickable #pills → /learn?tag=X.
 *
 * Hidden below lg via the parent grid (article-sidecar { display: none; }).
 */
export default function MarginalContents({
  verdict,
  tags = [],
}: MarginalContentsProps) {
  const router = useRouter();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Scrape headings from the rendered article body on mount.
  useEffect(() => {
    const article = document.querySelector("[data-article-body]");
    if (!article) return;
    const nodes = Array.from(article.querySelectorAll("h2"));
    const found: Heading[] = nodes.map((node) => {
      let id = node.id;
      if (!id) {
        id = slugify(node.textContent ?? "");
        node.id = id;
      }
      return { id, text: node.textContent ?? "" };
    });
    setHeadings(found);
    if (found.length > 0) setActiveId(found[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target.id);
        if (visible.length > 0) setActiveId(visible[0]);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.5, 1] }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const cleanTags = tags.filter(Boolean).slice(0, 8);
  const hasAnything = !!verdict || headings.length > 0 || cleanTags.length > 0;
  if (!hasAnything) return null;

  function goToTag(t: string) {
    router.push(`/learn?tag=${encodeURIComponent(t)}`);
  }

  return (
    <aside
      style={{
        position: "sticky",
        top: 100,
        alignSelf: "start",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {verdict}

      {headings.length > 0 && (
        <div
          style={{
            padding: "18px",
            border: "1px solid var(--rule-soft)",
            borderRadius: 14,
            background: "var(--paper-warm)",
          }}
        >
          <SectionLabel>Article contents</SectionLabel>
          <nav
            style={{
              marginTop: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontFamily: "var(--font-serif)",
              fontSize: 13.5,
              color: "var(--ink-soft)",
            }}
          >
            {headings.map((h) => {
              const isActive = h.id === activeId;
              return (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  style={{
                    color: isActive ? "var(--ink)" : "var(--ink-soft)",
                    fontWeight: isActive ? 500 : 400,
                    borderLeft: isActive
                      ? "2px solid var(--stamp)"
                      : "2px solid transparent",
                    paddingLeft: 10,
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                >
                  {h.text}
                </a>
              );
            })}
          </nav>
        </div>
      )}

      {cleanTags.length > 0 && (
        <div
          style={{
            padding: "14px 18px",
            border: "1px solid var(--rule-soft)",
            borderRadius: 14,
          }}
        >
          <SectionLabel>Tags</SectionLabel>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {cleanTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => goToTag(t)}
                style={{
                  fontSize: 11,
                  color: "var(--ink-mute)",
                  fontFamily: "var(--font-sans)",
                  border: "1px solid var(--rule-soft)",
                  padding: "2px 8px",
                  borderRadius: 2,
                  background: "transparent",
                  cursor: "pointer",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--stamp)";
                  e.currentTarget.style.borderColor = "var(--stamp)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--ink-mute)";
                  e.currentTarget.style.borderColor = "var(--rule-soft)";
                }}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
