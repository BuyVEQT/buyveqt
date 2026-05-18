import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";

interface CourseEntry {
  step: number;
  slug: string;
  title: string;
  readingTime: string;
}

/**
 * Course 1 — the home page's primary reading order. Hardcoded so it
 * stays independent of `/learn` syllabus changes. Same slugs the prior
 * HomeClient used; readingTime mirrors the MDX frontmatter.
 */
const COURSE_1: CourseEntry[] = [
  { step: 1, slug: "what-is-veqt", title: "What VEQT actually is", readingTime: "8 min" },
  { step: 2, slug: "veqt-vs-diy-portfolio", title: "Why one fund and hold forever", readingTime: "9 min" },
  { step: 3, slug: "veqt-is-down", title: "What to do when it's down", readingTime: "6 min" },
];

/**
 * Three compact article cards on home. Each row: number tile + step ·
 * readingTime kicker + Fraunces title + chevron. Links to /learn/{slug}.
 * Server component (no client state).
 */
export default function ArticleStrip() {
  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 14,
        }}
      >
        <div>
          <SectionLabel>Read up</SectionLabel>
          <div
            className="ed-display"
            style={{ fontSize: 24, marginTop: 4, letterSpacing: "-0.015em" }}
          >
            The course
          </div>
        </div>
        <Link
          href="/learn"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            color: "var(--ink-mute)",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          All →
        </Link>
      </div>
      <div>
        {COURSE_1.map((a, i) => (
          <Link
            key={a.slug}
            href={`/learn/${a.slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 4px",
              borderTop: i === 0 ? "1px solid var(--rule-soft)" : "none",
              borderBottom: "1px solid var(--rule-soft)",
              textDecoration: "none",
              color: "var(--ink)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                flexShrink: 0,
                background: "var(--paper-warm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: 18,
                color: "var(--stamp)",
              }}
            >
              {a.step}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ed-label">
                Step {a.step} · {a.readingTime}
              </div>
              <div
                className="ed-display"
                style={{
                  fontSize: 17,
                  marginTop: 4,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                }}
              >
                {a.title}
              </div>
            </div>
            <span
              aria-hidden
              style={{ color: "var(--ink-mute)", fontSize: 18 }}
            >
              ›
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
