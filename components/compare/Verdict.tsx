"use client";

import Card from "@/components/ui/Card";
import { getVerdict } from "@/lib/compare-verdicts";

interface VerdictProps {
  selected: string[];
}

/**
 * "Our take" — dark-band editorial verdict card. Shown only when exactly
 * two funds are selected AND the pair has a curated verdict.
 *
 * V2: dark Card with vermilion-filled "Our take" stamp, italic quoted headline,
 * muted paper body, hairline rule, vermilion left-border recommendation.
 */
export default function Verdict({ selected }: VerdictProps) {
  if (selected.length !== 2) return null;
  const verdict = getVerdict(selected[0], selected[1]);
  if (!verdict) return null;

  const slug = verdict.slug ?? `${selected[0].replace(".TO", "").toLowerCase()}-vs-${selected[1].replace(".TO", "").toLowerCase()}`;

  return (
    <Card dark className="editv">
      <div className="editv__top">
        <span
          className="ed-stamp"
          style={{
            color: "var(--band-paper)",
            background: "var(--stamp)",
            padding: "4px 10px",
            letterSpacing: "0.18em",
          }}
        >
          Our take
        </span>
        <span
          className="ed-stamp"
          style={{ color: "rgba(246,239,220,0.55)" }}
        >
          {slug.replace(/-/g, " · ")}
        </span>
      </div>

      <h3 className="ed-display-italic editv__h">
        &ldquo;{verdict.headline}&rdquo;
      </h3>

      <p className="ed-body editv__body">
        {verdict.summary ?? verdict.body ?? ""}
      </p>

      <div className="editv__rule" />

      <p className="editv__rec">
        <span className="ed-stamp editv__rec-stamp">Recommendation</span>
        {verdict.recommendation}
      </p>

      <style jsx>{`
        .editv {
          padding: 26px 28px 22px;
          display: flex;
          flex-direction: column;
        }
        .editv__top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 16px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .editv__h {
          font-size: clamp(1.6rem, 2.8vw, 2.1rem);
          line-height: 1.15;
          color: var(--band-paper);
          margin: 6px 0 12px;
          max-width: 36ch;
        }
        .editv__body {
          font-size: 15px;
          line-height: 1.55;
          color: rgba(246, 239, 220, 0.82);
          margin: 0 0 18px;
          max-width: 60ch;
        }
        .editv__rule {
          height: 1px;
          background: rgba(246, 239, 220, 0.22);
          margin: 6px 0 18px;
        }
        .editv__rec {
          font-family: var(--font-serif);
          font-size: 14.5px;
          line-height: 1.55;
          color: rgba(246, 239, 220, 0.88);
          margin: 0;
          padding-left: 16px;
          border-left: 2px solid var(--stamp);
          max-width: 64ch;
        }
        .editv__rec-stamp {
          display: block;
          color: var(--stamp);
          margin-bottom: 6px;
        }
      `}</style>
    </Card>
  );
}
