import { FUNDS } from "@/data/funds";

const css = `
.tote {
  border: 1px solid var(--ins-ink);
  font-family: var(--ins-font);
}
.tote__corners {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px minmax(0, 1fr);
}
.tote__corner {
  padding: 26px 28px;
  min-width: 0;
}
.tote__corner--red {
  background: var(--ins-ink);
  color: var(--ins-paper);
}
.tote__corner--blue {
  text-align: right;
}
.tote__kicker {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.tote__corner--red .tote__kicker {
  color: color-mix(in srgb, var(--ins-paper) 55%, transparent);
}
.tote__corner--blue .tote__kicker {
  color: var(--ins-gray-600);
}
.tote__ticker {
  margin: 10px 0 0;
  font-size: 72px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.9;
}
.tote__corner--blue .tote__ticker {
  color: color-mix(in srgb, var(--ins-ink) 35%, transparent);
}
.tote__facts {
  margin-top: 10px;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}
.tote__corner--red .tote__facts {
  color: color-mix(in srgb, var(--ins-paper) 55%, transparent);
}
.tote__corner--blue .tote__facts {
  color: var(--ins-gray-600);
}

/* Seam — the red × roundel straddling the two corners. */
.tote__seam {
  display: flex;
  align-items: center;
  justify-content: center;
}
.tote__ring {
  transform-origin: 40px 40px;
  animation: ins-ringPulse 2.2s ease-out infinite;
}

.tote__deck {
  border-top: 1px solid var(--ins-ink);
  padding: 14px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}
.tote__question {
  margin: 0;
  max-width: 44ch;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.25;
  text-wrap: pretty;
}
.tote__byline {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  text-align: right;
  white-space: nowrap;
}

/* Mobile seam divider — a plain × rule between the stacked corners. */
.tote__seamSm {
  display: none;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--ins-hair);
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  color: var(--ins-signal);
}

@media (max-width: 900px) {
  .tote__ticker {
    font-size: 56px;
  }
  .tote__corner {
    padding: 22px 20px;
  }
  .tote__corners {
    grid-template-columns: minmax(0, 1fr) 88px minmax(0, 1fr);
  }
  .tote__deck {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .tote__byline {
    text-align: left;
    white-space: normal;
  }
}

/* ── Mobile · 390 — corners stack, the roundel becomes a ruled × ── */
@media (max-width: 640px) {
  .tote__corners {
    grid-template-columns: minmax(0, 1fr);
  }
  .tote__seam {
    display: none;
  }
  .tote__seamSm {
    display: flex;
  }
  .tote__corner {
    padding: 16px 18px;
  }
  .tote__corner--blue {
    text-align: left;
  }
  .tote__kicker {
    font-size: 8px;
    letter-spacing: 0.18em;
  }
  .tote__ticker {
    margin-top: 6px;
    font-size: 44px;
    letter-spacing: -0.035em;
  }
  .tote__facts {
    font-size: 8.5px;
    letter-spacing: 0.14em;
  }
  .tote__deck {
    padding: 12px 18px;
  }
  .tote__question {
    font-size: 15px;
    line-height: 1.35;
  }
  .tote__byline {
    font-size: 8.5px;
    letter-spacing: 0.14em;
  }
}
`;

/** 13,726 → "13,700". The mock rounds both corners to the hundred. */
function roundedHoldings(n: number): string {
  return (Math.round(n / 100) * 100).toLocaleString("en-CA");
}

interface TaleOfTheTapeProps {
  /** The question deck in the footer row. */
  deck: string;
  /** Display date, already formatted ("May 31, 2026"). */
  updated: string;
  /** Frontmatter reading time ("12 min read"). */
  readingTime: string;
  /** Adds the "OUR TAKE" stamp to the byline. */
  editorial?: boolean;
}

/**
 * Tale of the tape — the flagship's scoreboard hero (artboard 7a). It
 * replaces <ArticleHeader> on /learn/veqt-vs-xeqt only.
 *
 * Two corners either side of a red × roundel: VEQT in the ink panel as the
 * original, XEQT in paper-grey as the response. The holdings figures come
 * from data/funds.ts and are rounded to the hundred for display, so a
 * factsheet update moves the hero without a code change.
 *
 * Server component — the roundel's pulse is pure CSS, so nothing here needs
 * to ship to the client. Styles go out as a plain <style> tag rather than
 * styled-jsx, which would force "use client".
 */
export default function TaleOfTheTape({
  deck,
  updated,
  readingTime,
  editorial = false,
}: TaleOfTheTapeProps) {
  const veqt = FUNDS["VEQT.TO"];
  const xeqt = FUNDS["XEQT.TO"];
  const minutes = readingTime.replace(/\s*read\s*$/i, "").trim();

  return (
    <section className="tote" aria-labelledby="tote-deck">
      <div className="tote__corners">
        <div className="tote__corner tote__corner--red">
          <div className="tote__kicker">In the red corner · The original</div>
          <div className="tote__ticker">VEQT</div>
          <div className="tote__facts">
            Vanguard · Investor-owned · {roundedHoldings(veqt.numberOfHoldings)}{" "}
            holdings
          </div>
        </div>

        <div className="tote__seam" aria-hidden>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle
              className="tote__ring"
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke="var(--ins-signal)"
              strokeWidth="1.5"
            />
            <text
              x="40"
              y="52"
              textAnchor="middle"
              fontSize="34"
              fontWeight="800"
              fill="var(--ins-signal)"
            >
              ×
            </text>
          </svg>
        </div>

        <div className="tote__seamSm" aria-hidden>
          ×
        </div>

        <div className="tote__corner tote__corner--blue">
          <div className="tote__kicker">In the blue corner · The response</div>
          <div className="tote__ticker">XEQT</div>
          <div className="tote__facts">
            BlackRock · NYSE: BLK · {roundedHoldings(xeqt.numberOfHoldings)}{" "}
            holdings
          </div>
        </div>
      </div>

      <div className="tote__deck">
        <h1 className="tote__question" id="tote-deck">
          {deck}
        </h1>
        <div className="tote__byline">
          By BuyVEQT · Updated {updated}
          {editorial && " · Our take"} · {minutes}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
