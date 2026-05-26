import Link from "next/link";
import Card from "@/components/ui/Card";

const SOURCES = [
  { label: "Vanguard Canada NAV",  note: "holdings, weights" },
  { label: "Yahoo Finance",         note: "price, history" },
  { label: "GICS classification",  note: "sectors" },
  { label: "Q1 2026 factsheet",    note: "geography" },
] as const;

/**
 * V2 dark methodology band.
 *
 * "How we know" (ed-stamp) + "The methodology." (ed-display-italic)
 * + body copy + sources sub-list (4 rows) + two-link footer.
 */
export default function InsideMethodology() {
  return (
    <Card dark>
      <div className="method">
        {/* V2 heading pattern: ed-stamp kicker + ed-display-italic title */}
        <div
          className="ed-stamp"
          style={{ color: "rgba(246,239,220,0.55)" }}
        >
          How we know
        </div>
        <h2 className="ed-display-italic method__h2">The methodology.</h2>

        <p className="method__body">
          Holdings are pulled from Vanguard Canada&rsquo;s daily NAV file, then
          attributed back to sleeves by region. Sector tags follow the GICS
          classification. Numbers update with the underlying ETFs — there is
          nothing proprietary here.
        </p>

        {/* Sources sub-list — between body and links row */}
        <ul className="method__sources">
          {SOURCES.map((s) => (
            <li key={s.label} className="method__source">
              <span className="method__source-label">{s.label}</span>
              <span className="method__source-note">{s.note}</span>
            </li>
          ))}
        </ul>

        {/* Links row */}
        <div className="method__links">
          <Link href="/methodology" className="method__link">
            Read methodology →
          </Link>
          <Link
            href="/methodology#sources"
            className="method__link method__link--quiet"
          >
            Sources
          </Link>
        </div>
      </div>

      <style jsx>{`
        .method {
          display: flex;
          flex-direction: column;
        }
        .method__h2 {
          font-size: clamp(1.5rem, 2.4vw, 1.9rem);
          line-height: 1.05;
          margin: 8px 0 14px;
          color: var(--band-paper);
        }
        .method__body {
          font-family: var(--font-serif);
          font-size: 15px;
          line-height: 1.55;
          color: rgba(246, 239, 220, 0.78);
          margin: 0 0 0;
          max-width: 54ch;
        }
        /* Sources list */
        .method__sources {
          list-style: none;
          margin: 0 0 22px;
          padding: 14px 0 0;
          border-top: 1px solid rgba(246, 239, 220, 0.18);
        }
        .method__source {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          padding: 8px 0;
          font-family: var(--font-serif);
          font-size: 13px;
          color: var(--band-paper);
          border-bottom: 1px solid rgba(246, 239, 220, 0.1);
          align-items: baseline;
        }
        .method__source:last-child {
          border-bottom: none;
        }
        .method__source-label {
          opacity: 0.88;
          min-width: 0;
        }
        .method__source-note {
          font-style: italic;
          color: rgba(246, 239, 220, 0.55);
          text-align: right;
          font-size: 12.5px;
          white-space: nowrap;
        }
        /* Links row */
        .method__links {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          margin-top: auto;
        }
        .method__link {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--band-paper);
          border-bottom: 1px solid var(--stamp);
          padding-bottom: 4px;
          text-decoration: none;
        }
        .method__link--quiet {
          color: rgba(246, 239, 220, 0.6);
          border-bottom-color: rgba(246, 239, 220, 0.3);
        }
      `}</style>
    </Card>
  );
}
