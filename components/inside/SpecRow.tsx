import InfoTooltip from "@/components/ui/InfoTooltip";

interface SpecItem {
  label: string;
  value: string;
  sub: string;
  tooltip?: string;
}

interface SpecRowProps {
  items: SpecItem[];
}

/**
 * Inline 4-cell stat strip used inside InsideHero.
 * Hairline-bordered top + bottom; hairlines between cells.
 * 2-column grid on mobile, 4-column at ≥760px.
 */
export default function SpecRow({ items }: SpecRowProps) {
  return (
    <div className="spec-row">
      {items.map((it) => (
        <div key={it.label} className="spec-row__cell">
          <div className="ed-label">
            {it.label}
            {it.tooltip && <InfoTooltip content={it.tooltip} />}
          </div>
          <div className="ed-display ed-numerals spec-row__val">{it.value}</div>
          <div className="ed-caption spec-row__sub">{it.sub}</div>
        </div>
      ))}

      <style jsx>{`
        .spec-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0;
          margin-top: 22px;
          border-top: 1px solid var(--ink);
          border-bottom: 1px solid var(--ink);
        }
        @media (min-width: 760px) {
          .spec-row {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .spec-row__cell {
          padding: 18px 18px 16px;
          border-right: 1px solid var(--rule-soft);
          border-bottom: 1px solid var(--rule-soft);
        }
        .spec-row__cell:nth-child(2n) {
          border-right: none;
        }
        @media (min-width: 760px) {
          .spec-row__cell:nth-child(2n) {
            border-right: 1px solid var(--rule-soft);
          }
          .spec-row__cell:nth-child(4n) {
            border-right: none;
          }
          .spec-row__cell {
            border-bottom: none;
          }
        }
        .spec-row__val {
          font-size: clamp(1.8rem, 2.6vw, 2rem);
          line-height: 1.05;
          letter-spacing: -0.015em;
          margin-top: 8px;
          color: var(--ink);
        }
        .spec-row__sub {
          margin-top: 4px;
          font-size: 12px;
          color: var(--ink-mute);
        }
      `}</style>
    </div>
  );
}
