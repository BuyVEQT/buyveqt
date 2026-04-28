import type { HistoricalData } from "@/lib/data/types";

interface StandingFeatureProps {
  history: HistoricalData | null;
}

const HYPOTHETICAL_AMOUNT = 10_000;

function fmtCAD(n: number): string {
  return n.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function fmtMonthYear(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });
}

/**
 * The Standing — a single "magnitude up front" stat, parallel to
 * /distributions' worked example. Shows what $10k at VEQT's inception
 * would be worth today, computed from the historical price series.
 *
 * Server-rendered; no interactivity. Hidden when history is unavailable.
 */
export default function StandingFeature({ history }: StandingFeatureProps) {
  if (!history || !history.data || history.data.length < 2) return null;

  const data = history.data;
  const first = data[0];
  const last = data[data.length - 1];
  if (first.adjustedClose <= 0 || last.adjustedClose <= 0) return null;

  const units = HYPOTHETICAL_AMOUNT / first.adjustedClose;
  const todayValue = units * last.adjustedClose;
  const totalReturnPct =
    ((todayValue - HYPOTHETICAL_AMOUNT) / HYPOTHETICAL_AMOUNT) * 100;
  const years =
    (new Date(last.date).getTime() - new Date(first.date).getTime()) /
    (365.25 * 24 * 60 * 60 * 1000);
  const cagr = years > 0 ? Math.pow(todayValue / HYPOTHETICAL_AMOUNT, 1 / years) - 1 : null;

  return (
    <section
      className="mt-8 sm:mt-10 pt-6 border-t-2 border-[var(--ink)]"
      aria-labelledby="standing-heading"
    >
      <p id="standing-heading" className="bs-stamp mb-4">
        The Standing
      </p>
      <h2
        className="bs-display text-[1.5rem] sm:text-[2rem] mb-5"
        style={{ color: "var(--ink)" }}
      >
        <em>What $10,000 became</em>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        <div>
          <p className="bs-label mb-2" style={{ color: "var(--ink-soft)" }}>
            Today&apos;s value
          </p>
          <p
            className="bs-numerals tabular-nums text-[2rem] sm:text-[2.5rem] leading-none"
            style={{ color: "var(--stamp)" }}
          >
            {fmtCAD(todayValue)}
          </p>
          <p
            className="bs-caption italic mt-2 text-[12.5px]"
            style={{ color: "var(--ink-soft)" }}
          >
            From {fmtMonthYear(first.date)}, reinvested, no fees.
          </p>
        </div>

        <div>
          <p className="bs-label mb-2" style={{ color: "var(--ink-soft)" }}>
            Total return
          </p>
          <p
            className="bs-numerals tabular-nums text-[2rem] sm:text-[2.5rem] leading-none"
            style={{ color: "var(--ink)" }}
          >
            {totalReturnPct >= 0 ? "+" : ""}
            {totalReturnPct.toFixed(0)}
            <span className="text-[1.5rem] align-top ml-0.5">%</span>
          </p>
          <p
            className="bs-caption italic mt-2 text-[12.5px]"
            style={{ color: "var(--ink-soft)" }}
          >
            Past performance is not a forecast.
          </p>
        </div>

        <div>
          <p className="bs-label mb-2" style={{ color: "var(--ink-soft)" }}>
            Per year (CAGR)
          </p>
          <p
            className="bs-numerals tabular-nums text-[2rem] sm:text-[2.5rem] leading-none"
            style={{ color: "var(--ink)" }}
          >
            {cagr !== null ? (
              <>
                +{(cagr * 100).toFixed(1)}
                <span className="text-[1.5rem] align-top ml-0.5">%</span>
              </>
            ) : (
              "—"
            )}
          </p>
          <p
            className="bs-caption italic mt-2 text-[12.5px]"
            style={{ color: "var(--ink-soft)" }}
          >
            Compound annual growth rate since inception.
          </p>
        </div>
      </div>
    </section>
  );
}
