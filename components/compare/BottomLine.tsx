import { getVerdict } from "@/data/verdicts";

interface BottomLineProps {
  slug: string;
  fundA: string;
  fundB: string;
  className?: string;
}

function WinnerBadge({ winner, fundA, fundB }: { winner: string; fundA: string; fundB: string }) {
  if (winner === "Tie") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-[var(--color-text-muted)]">
        Tie
      </span>
    );
  }

  const isA = winner.toUpperCase() === fundA.replace(".TO", "").toUpperCase();
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
        isA
          ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
          : "bg-[var(--color-chart-line)]/10 text-[var(--color-chart-line)]"
      }`}
    >
      {winner}
    </span>
  );
}

export default function BottomLine({ slug, fundA, fundB, className }: BottomLineProps) {
  const verdict = getVerdict(slug);
  if (!verdict) return null;

  return (
    <section className={`mt-8 pt-8 border-t border-[var(--color-border)] ${className ?? ""}`}>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
        The Bottom Line
      </h2>

      {/* Summary */}
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-prose mb-6">
        {verdict.summary}
      </p>

      {/* Verdict Points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {verdict.points.map((point) => (
          <div
            key={point.label}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                {point.label}
              </span>
              <WinnerBadge winner={point.winner} fundA={fundA} fundB={fundB} />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {point.explanation}
            </p>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] p-4 mb-4">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
          Our recommendation
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {verdict.recommendation}
        </p>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
        This comparison reflects our editorial analysis based on publicly available fund data.
        It is not financial advice. Your situation may differ.
      </p>
    </section>
  );
}
