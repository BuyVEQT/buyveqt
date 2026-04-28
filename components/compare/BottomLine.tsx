import { getVerdict } from "@/data/verdicts";

interface BottomLineProps {
  slug: string;
  fundA: string;
  fundB: string;
  className?: string;
}

/**
 * Per-pair "scorecard" — only renders when there's a curated verdict in
 * data/verdicts.ts for the slug. Re-skinned in the broadsheet voice:
 * stamped eyebrow, display headline, ledger-style point grid with vermilion
 * winner badge, and a final italic recommendation block.
 */
function WinnerBadge({
  winner,
  fundA,
  fundB,
}: {
  winner: string;
  fundA: string;
  fundB: string;
}) {
  if (winner === "Tie") {
    return (
      <span
        className="bs-label text-[10px] tabular-nums"
        style={{
          color: "var(--ink-soft)",
          letterSpacing: "0.14em",
        }}
      >
        TIE
      </span>
    );
  }

  const isA = winner.toUpperCase() === fundA.replace(".TO", "").toUpperCase();
  return (
    <span
      className="bs-label text-[10px] tabular-nums"
      style={{
        color: "var(--paper)",
        backgroundColor: isA ? "var(--stamp)" : "var(--ink)",
        padding: "3px 7px 2px",
        letterSpacing: "0.14em",
      }}
    >
      {winner}
    </span>
  );
}

export default function BottomLine({
  slug,
  fundA,
  fundB,
  className,
}: BottomLineProps) {
  const verdict = getVerdict(slug);
  if (!verdict) return null;

  return (
    <section
      className={`border-t-2 border-[var(--ink)] pt-6 ${className ?? ""}`}
      aria-labelledby="bottomline-heading"
    >
      <header className="mb-4">
        <p id="bottomline-heading" className="bs-stamp mb-1">
          The Scorecard
        </p>
        <h2
          className="bs-display text-[1.5rem] sm:text-[1.875rem] leading-tight"
          style={{ color: "var(--ink)" }}
        >
          <em>Round-by-round,</em> who took it
        </h2>
      </header>

      <p
        className="bs-body text-[15px] leading-[1.55] max-w-[68ch] mb-6"
        style={{ color: "var(--ink)" }}
      >
        {verdict.summary}
      </p>

      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
        {verdict.points.map((point, idx) => (
          <li
            key={point.label}
            className={`py-4 ${
              idx < 2
                ? "border-t border-[var(--color-border)]"
                : "border-t border-[var(--color-border)]"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3
                className="bs-display text-[1rem] sm:text-[1.125rem]"
                style={{ color: "var(--ink)" }}
              >
                {point.label}
              </h3>
              <WinnerBadge
                winner={point.winner}
                fundA={fundA}
                fundB={fundB}
              />
            </div>
            <p
              className="bs-caption text-[12.5px] leading-[1.55] max-w-[44ch]"
              style={{ color: "var(--ink-soft)" }}
            >
              {point.explanation}
            </p>
          </li>
        ))}
      </ol>

      <div
        className="mt-6 pt-5 border-t border-[var(--color-border)]"
        style={{ borderColor: "var(--ink)", borderTopWidth: "1px" }}
      >
        <p className="bs-stamp mb-2">Our recommendation</p>
        <p
          className="bs-display text-[1.125rem] sm:text-[1.25rem] leading-[1.4] max-w-[68ch]"
          style={{ color: "var(--ink)" }}
        >
          {verdict.recommendation}
        </p>
      </div>

      <p
        className="bs-caption italic text-[11px] mt-4"
        style={{ color: "var(--ink-soft)" }}
      >
        Editorial analysis based on publicly available fund data. Not
        financial advice. Your situation may differ.
      </p>
    </section>
  );
}
