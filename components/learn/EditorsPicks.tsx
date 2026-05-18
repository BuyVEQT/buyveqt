import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";
import { EDITORS_PICKS } from "@/lib/editors-picks";
import { isInteractive } from "@/lib/interactive-slugs";
import SectionHead from "@/components/ui/SectionHead";

interface EditorsPicksProps {
  articles: ArticleFrontmatter[];
}

/**
 * "Editor's picks" 3-up card row, shown only when no filters are
 * active on /learn. Cards: time + optional Tool badge eyebrow,
 * Fraunces title, Newsreader italic blurb.
 */
export default function EditorsPicks({ articles }: EditorsPicksProps) {
  const picks = EDITORS_PICKS
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is ArticleFrontmatter => !!a);

  if (picks.length === 0) return null;

  return (
    <section style={{ paddingTop: 4 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <SectionHead
          kicker="Editor's picks"
          title="Three to start with."
          size="lg"
        />
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 14,
            color: "var(--ink-mute)",
          }}
        >
          If you only read three things this month.
        </span>
      </div>

      <div className="learn-picks-grid">
        {picks.map((a) => {
          const tool = isInteractive(a.slug);
          return (
            <Link
              key={a.slug}
              href={`/learn/${a.slug}`}
              style={{
                display: "block",
                padding: "18px 18px 16px",
                background: "var(--paper-light)",
                border: "1px solid var(--rule-soft)",
                borderRadius: 12,
                textDecoration: "none",
                color: "inherit",
                transition: "background 0.15s, transform 0.12s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span className="ed-label" style={{ color: "var(--ink-mute)" }}>
                  {a.readingTime}
                </span>
                {tool && (
                  <span
                    className="ed-label"
                    style={{
                      color: "var(--stamp)",
                      border: "1px solid var(--stamp)",
                      padding: "2px 6px",
                      borderRadius: 3,
                      fontSize: 9,
                    }}
                  >
                    Tool
                  </span>
                )}
              </div>
              <div
                className="ed-display"
                style={{
                  fontSize: 18,
                  lineHeight: 1.2,
                  letterSpacing: "-0.012em",
                  color: "var(--ink)",
                }}
              >
                {a.title}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "var(--ink-soft)",
                  marginTop: 8,
                }}
              >
                {a.excerpt || a.description}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
