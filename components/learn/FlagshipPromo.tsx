"use client";

import Link from "next/link";
import { VERDICTS, pairKey } from "@/lib/compare-verdicts";

/**
 * The /learn page's editorial centerpiece.
 *
 * Wide 2-col layout on desktop (`>= 960px`):
 *   - Left (1.45fr): vermilion-filled eyebrow + huge VEQT × XEQT lockup
 *     + italic pull-quote (verdict.headline) + body sell + dark CTA pill
 *   - Right (1fr): cream-card "The judges' scorecard" preview pulling
 *     verdict.points to show a 5-round breakdown with tally + winner badges
 *
 * CTA routes to the /learn/veqt-vs-xeqt article (not /compare) — the
 * flagship is selling the editorial read, not the tool.
 */
export default function FlagshipPromo() {
  const verdict = VERDICTS[pairKey("VEQT.TO", "XEQT.TO")];
  if (!verdict) return null;

  // Tally counts for the scorecard pill
  const veqtWins = verdict.points.filter((p) => p.winner === "VEQT").length;
  const xeqtWins = verdict.points.filter((p) => p.winner === "XEQT").length;
  const ties = verdict.points.filter((p) => p.winner === "Tie").length;

  function winnerClass(w: string): string {
    if (w === "VEQT") return "flagship__round-w--a";
    if (w === "XEQT") return "flagship__round-w--b";
    return "flagship__round-w--tie";
  }

  return (
    <section className="flagship" aria-label="Flagship dispatch: VEQT vs XEQT">
      <div className="flagship__main">
        <div className="flagship__eyebrow">
          <span
            className="ed-stamp"
            style={{
              color: "var(--paper-light)",
              background: "var(--stamp)",
              padding: "5px 12px 4px",
              letterSpacing: "0.22em",
            }}
          >
            Featured · The marquee fight
          </span>
          <span className="ed-stamp" style={{ color: "var(--ink-mute)" }}>
            10 min read · Beginner
          </span>
        </div>
        <h2 className="flagship__title">
          <span className="ed-display ed-numerals flagship__ticker">VEQT</span>
          <span className="ed-display-italic flagship__times">×</span>
          <span className="ed-display ed-numerals flagship__ticker">XEQT</span>
        </h2>
        <p className="ed-display-italic flagship__pull">
          &ldquo;{verdict.headline}&rdquo;
        </p>
        <p className="ed-body flagship__body">
          The comparison every Canadian passive investor asks about first.
          We break it down round-by-round across cost, allocation, fund
          size, and the small differences that won&apos;t matter in
          twenty years.
        </p>
        <Link href={`/learn/${verdict.slug}`} className="flagship__cta">
          <span>Read the comparison</span>
          <span aria-hidden className="flagship__cta-arrow">→</span>
        </Link>
      </div>

      <aside className="flagship__scorecard">
        <div className="ed-stamp" style={{ color: "var(--ink-mute)" }}>
          The judges&apos; scorecard
        </div>
        <div className="flagship__tally">
          <div className="flagship__tally-side">
            <div
              className="ed-numerals flagship__tally-num"
              style={{ color: "var(--stamp)" }}
            >
              {veqtWins}
            </div>
            <div className="ed-label flagship__tally-label">VEQT</div>
          </div>
          <div className="flagship__tally-mid">
            <span className="ed-display-italic">/</span>
            <div className="ed-label">{ties} ties</div>
          </div>
          <div className="flagship__tally-side">
            <div
              className="ed-numerals flagship__tally-num"
              style={{ color: "var(--ink)" }}
            >
              {xeqtWins}
            </div>
            <div className="ed-label flagship__tally-label">XEQT</div>
          </div>
        </div>
        <ul className="flagship__rounds">
          {verdict.points.slice(0, 5).map((p, i) => (
            <li key={p.label}>
              <span className="flagship__round-n">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{p.label}</span>
              <span
                className={`flagship__round-w ${winnerClass(p.winner)}`}
              >
                {p.winner}
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <style jsx global>{`
        .flagship {
          display: grid;
          grid-template-columns: 1fr;
          gap: 22px;
          padding: 30px 0 36px;
        }
        @media (min-width: 960px) {
          .flagship {
            grid-template-columns: 1.45fr 1fr;
            align-items: stretch;
          }
        }
        .flagship__main {
          display: flex;
          flex-direction: column;
          padding: 0;
        }
        .flagship__eyebrow {
          display: flex;
          gap: 14px;
          align-items: baseline;
          flex-wrap: wrap;
        }
        .flagship__title {
          margin: 22px 0 14px;
          display: flex;
          align-items: baseline;
          gap: 16px;
          flex-wrap: wrap;
        }
        .flagship__ticker {
          font-size: clamp(3.4rem, 8vw, 6.4rem);
          line-height: 0.92;
          letter-spacing: -0.035em;
          color: var(--ink);
        }
        .flagship__times {
          font-size: clamp(2.6rem, 6vw, 5rem);
          line-height: 0.92;
          color: var(--stamp);
          margin: 0 4px;
        }
        .flagship__pull {
          font-size: clamp(1.4rem, 2.4vw, 1.9rem);
          line-height: 1.15;
          color: var(--ink);
          margin: 0 0 18px;
          max-width: 28ch;
          letter-spacing: -0.015em;
        }
        .flagship__body {
          font-size: 15px;
          line-height: 1.55;
          color: var(--ink-soft);
          margin: 0 0 24px;
          max-width: 52ch;
        }
        .flagship__cta {
          margin-top: auto;
          display: inline-flex;
          align-self: flex-start;
          align-items: center;
          gap: 12px;
          padding: 14px 22px;
          background: var(--ink);
          color: var(--paper-light);
          border-radius: 999px;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          transition: transform 0.18s, background 0.18s;
        }
        .flagship__cta:hover {
          background: var(--stamp);
          transform: translateX(3px);
        }
        .flagship__cta-arrow {
          color: var(--stamp);
          font-size: 16px;
        }
        .flagship__cta:hover .flagship__cta-arrow {
          color: var(--paper-light);
        }

        .flagship__scorecard {
          padding: 22px 24px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-radius: 18px;
          display: flex;
          flex-direction: column;
        }
        .flagship__tally {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          margin: 14px 0 18px;
          background: var(--paper-warm);
          border-radius: 10px;
        }
        .flagship__tally-side {
          text-align: center;
          flex: 1;
        }
        .flagship__tally-num {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(2.2rem, 4vw, 3rem);
          line-height: 1;
          letter-spacing: -0.025em;
        }
        .flagship__tally-label {
          margin-top: 4px;
          color: var(--ink-mute);
        }
        .flagship__tally-mid {
          text-align: center;
          color: var(--ink-mute);
        }
        .flagship__tally-mid .ed-display-italic {
          font-size: 22px;
          color: var(--ink-faint);
        }

        .flagship__rounds {
          list-style: none;
          margin: 0;
          padding: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .flagship__rounds li {
          display: grid;
          grid-template-columns: 28px 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 9px 0;
          font-family: var(--font-serif);
          font-size: 13.5px;
          color: var(--ink);
          border-bottom: 1px solid var(--rule-soft);
        }
        .flagship__rounds li:last-child {
          border-bottom: none;
        }
        .flagship__round-n {
          font-family: var(--font-display);
          font-weight: 500;
          color: var(--ink-mute);
          font-size: 14px;
        }
        .flagship__round-w {
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 3px 9px;
          border-radius: 999px;
          border: 1.5px solid var(--rule);
          color: var(--ink-mute);
          background: var(--paper-light);
          white-space: nowrap;
        }
        .flagship__round-w--a {
          color: var(--stamp);
          border-color: var(--stamp);
        }
        .flagship__round-w--b {
          color: var(--ink);
          border-color: var(--ink);
        }
        .flagship__round-w--tie {
          color: var(--ink-mute);
          border-color: var(--rule);
        }
      `}</style>
    </section>
  );
}
