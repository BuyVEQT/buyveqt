"use client";

import Link from "next/link";
import type { LearnPath } from "@/lib/learn-paths-data";
import type { ArticleFrontmatter } from "@/lib/articles";

interface PathCardProps {
  path: LearnPath;
  /** Lookup helper to resolve a slug → article metadata for the back face. */
  byslug: (slug: string) => ArticleFrontmatter | undefined;
}

/**
 * V2 path card — flips to reveal the reading order on hover/focus-within.
 *
 *  - Front: question (eyebrow) + italic title + description + meta row
 *  - Back: numbered list of up to 5 article titles + reading times
 *
 * The whole card is a Link to `/learn/path/{id}`; the back face is
 * `pointer-events: none` so clicks pass through to the wrapping anchor.
 */
export default function PathCard({ path, byslug }: PathCardProps) {
  const articles = path.slugs
    .map((s) => byslug(s))
    .filter((a): a is ArticleFrontmatter => !!a);
  const question = path.question ?? path.title;

  return (
    <Link href={`/learn/path/${path.id}`} className="pathcard">
      <div className="pathcard__face">
        <div className="ed-stamp pathcard__question">{question}</div>
        <h3 className="ed-display-italic pathcard__title">{path.title}</h3>
        <p className="ed-body pathcard__desc">{path.description}</p>
        <div className="pathcard__meta">
          <span className="ed-label">{articles.length} dispatches</span>
          <span className="ed-stamp pathcard__cta">See the path →</span>
        </div>
      </div>
      <div className="pathcard__back" aria-hidden>
        <div className="ed-stamp" style={{ color: "var(--stamp)" }}>
          {path.title}
        </div>
        <ol className="pathcard__list">
          {articles.slice(0, 5).map((a, i) => (
            <li key={a.slug} className="pathcard__list-item">
              <span className="ed-numerals pathcard__list-n">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="pathcard__list-title">{a.title}</span>
              <span className="ed-caption pathcard__list-time">
                {a.readingTime}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <style jsx global>{`
        .pathcard {
          position: relative;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-radius: 18px;
          padding: 22px 22px 18px;
          min-height: 220px;
          overflow: hidden;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .pathcard:hover {
          border-color: var(--ink);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(15, 13, 10, 0.06);
        }
        .pathcard__face {
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: opacity 0.2s;
        }
        .pathcard__back {
          position: absolute;
          inset: 22px 22px 18px;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.25s, transform 0.25s;
          pointer-events: none;
        }
        .pathcard:hover .pathcard__face,
        .pathcard:focus-within .pathcard__face {
          opacity: 0;
        }
        .pathcard:hover .pathcard__back,
        .pathcard:focus-within .pathcard__back {
          opacity: 1;
          transform: translateY(0);
        }
        .pathcard__question {
          color: var(--ink-mute);
        }
        .pathcard__title {
          margin: 6px 0 8px;
          font-size: clamp(1.5rem, 2.4vw, 2rem);
          line-height: 1.1;
          color: var(--ink);
        }
        .pathcard__desc {
          font-size: 13.5px;
          line-height: 1.55;
          color: var(--ink-soft);
          margin: 0 0 16px;
          flex: 1;
        }
        .pathcard__meta {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 10px;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid var(--rule-soft);
        }
        .pathcard__cta {
          color: var(--stamp);
        }
        .pathcard__list {
          list-style: none;
          margin: 12px 0 0;
          padding: 0;
        }
        .pathcard__list-item {
          display: grid;
          grid-template-columns: 24px 1fr auto;
          gap: 10px;
          padding: 6px 0;
          font-family: var(--font-serif);
          font-size: 13px;
          color: var(--ink);
          border-bottom: 1px dashed var(--rule-hair);
          align-items: baseline;
        }
        .pathcard__list-item:last-child {
          border-bottom: none;
        }
        .pathcard__list-n {
          font-family: var(--font-display);
          color: var(--ink-mute);
          font-size: 13px;
        }
        .pathcard__list-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pathcard__list-time {
          font-size: 11px;
          font-style: italic;
          color: var(--ink-mute);
        }
      `}</style>
    </Link>
  );
}
