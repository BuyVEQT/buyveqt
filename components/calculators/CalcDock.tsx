"use client";

/**
 * CalcDock — three quick-jump tiles between Lookback and the three
 * forward-looking calculators. Each tile is a same-page anchor (#dca,
 * #tfsa, #fire) so a reader can preview "what's below" without scrolling.
 */
const TILES = [
  {
    id: "dca",
    anchor: "#dca",
    kicker: "Calculator 02 · DCA",
    title: "Dollar-cost average.",
    blurb: "Project a monthly contribution forward.",
  },
  {
    id: "tfsa",
    anchor: "#tfsa",
    kicker: "Calculator 03 · Account growth",
    title: "TFSA · RRSP · FHSA.",
    blurb: "Shelter the math, then watch it grow.",
  },
  {
    id: "fire",
    anchor: "#fire",
    kicker: "Calculator 04 · FIRE",
    title: "Years to financial independence.",
    blurb: "When the portfolio earns more than you spend.",
  },
] as const;

export default function CalcDock() {
  return (
    <section className="dock">
      <div className="dock__head">
        <div>
          <div className="ed-stamp">Three more calculators</div>
          <h2 className="ed-display-italic dock__h2">
            Then{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>look forward.</em>
          </h2>
        </div>
        <p className="ed-caption dock__deck">
          The lookback tells you what was. These three ask you to assume.
        </p>
      </div>
      <div className="rule-thick" />
      <div className="dock__grid">
        {TILES.map((tile) => (
          <a key={tile.id} href={tile.anchor} className="dock__tile">
            <span className="ed-stamp dock__tile-kicker">{tile.kicker}</span>
            <h3 className="ed-display-italic dock__tile-title">{tile.title}</h3>
            <p className="ed-body dock__tile-blurb">{tile.blurb}</p>
            <span className="dock__tile-cta">Jump down &rarr;</span>
          </a>
        ))}
      </div>

      <style jsx>{`
        .dock {
          padding: 30px 0 18px;
        }
        .dock__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .dock__h2 {
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 6px 0 0;
          color: var(--ink);
        }
        .dock__deck {
          flex: 0 1 360px;
          max-width: 360px;
          font-size: 13px;
        }
        .dock__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 18px;
        }
        @media (min-width: 760px) {
          .dock__grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }
        }
        .dock__tile {
          display: flex;
          flex-direction: column;
          padding: 22px 22px 20px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s;
        }
        .dock__tile:hover {
          border-color: var(--ink);
          transform: translateY(-2px);
          box-shadow: 0 4px 18px rgba(15, 13, 10, 0.05);
        }
        .dock__tile-kicker {
          color: var(--ink-mute);
        }
        .dock__tile-title {
          margin: 8px 0 8px;
          font-size: clamp(1.3rem, 1.9vw, 1.5rem);
          line-height: 1.1;
          color: var(--ink);
        }
        .dock__tile-blurb {
          font-size: 14px;
          color: var(--ink-soft);
          line-height: 1.5;
          margin: 0 0 14px;
          flex: 1;
        }
        .dock__tile-cta {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--stamp);
        }
      `}</style>
    </section>
  );
}
