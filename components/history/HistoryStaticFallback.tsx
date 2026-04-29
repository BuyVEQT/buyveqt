import {
  HISTORY,
  dateProgress,
  priceProgress,
} from "@/lib/veqt-history";

const CHART_W = 800;
const CHART_H = 280;
const PAD_TOP = 16;
const PAD_BOTTOM = 36;
const PAD_X = 14;

function pricePathD(): string {
  const usableW = CHART_W - PAD_X * 2;
  const usableH = CHART_H - PAD_TOP - PAD_BOTTOM;
  return HISTORY.series
    .map((pt, i) => {
      const x = PAD_X + dateProgress(pt.d) * usableW;
      const y = PAD_TOP + (1 - priceProgress(pt.p)) * usableH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/**
 * Mobile / narrow-viewport fallback for the sticky scroll-locked
 * timeline. Renders the same data as a single static SVG plus a
 * vertical stack of anchor markers. Sticky scroll on iOS Safari is
 * a usability disaster — this is the explicit alternative.
 */
export default function HistoryStaticFallback() {
  const path = pricePathD();
  const launchValue = 10000;
  const lastPrice = HISTORY.series[HISTORY.series.length - 1].p;
  const finalValue = (launchValue * lastPrice) / HISTORY.launchPrice;

  return (
    <section className="lg:hidden bs-enter">
      <header className="pt-8 pb-6">
        <p className="bs-stamp mb-3" style={{ color: "var(--stamp)" }}>
          /history
        </p>
        <h1
          className="bs-display text-[2rem] sm:text-[2.5rem] leading-[1]"
          style={{ color: "var(--ink)" }}
        >
          Seven years of
          <br />
          <em className="bs-display-italic">one ticker.</em>
        </h1>
      </header>

      {/* Static price chart */}
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block w-full h-[260px] mb-5"
        aria-label="VEQT price, January 2019 to today"
      >
        <path
          d={`${path} L${(CHART_W - PAD_X).toFixed(1)},${(CHART_H - PAD_BOTTOM).toFixed(1)} L${PAD_X.toFixed(1)},${(CHART_H - PAD_BOTTOM).toFixed(1)} Z`}
          fill="var(--stamp)"
          opacity={0.06}
        />
        <path
          d={path}
          stroke="var(--stamp)"
          strokeWidth={1.75}
          fill="none"
          strokeLinejoin="round"
        />
        {HISTORY.anchors.map((a) => {
          const usableW = CHART_W - PAD_X * 2;
          const usableH = CHART_H - PAD_TOP - PAD_BOTTOM;
          const x = PAD_X + dateProgress(a.date) * usableW;
          const y = PAD_TOP + (1 - priceProgress(a.price)) * usableH;
          return (
            <g key={a.id}>
              <circle
                cx={x}
                cy={y}
                r={a.id === "today" ? 4 : 3}
                fill="var(--stamp)"
                stroke={a.id === "today" ? "var(--ink)" : "none"}
                strokeWidth={a.id === "today" ? 1 : 0}
              />
              <text
                x={x}
                y={CHART_H - PAD_BOTTOM + 18}
                textAnchor="middle"
                fill="var(--ink-mute)"
                style={{ fontFamily: "var(--font-mono)", fontSize: 9 }}
              >
                {a.date.slice(0, 7)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Inline journey strip */}
      <div className="border-t-2 border-[var(--ink)] pt-3 mb-8">
        <p className="bs-label" style={{ color: "var(--ink-soft)" }}>
          $10K at launch
        </p>
        <p
          className="text-[1.875rem] tabular-nums mt-1 leading-none"
          style={{
            color: "var(--stamp)",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
          }}
        >
          {finalValue.toLocaleString("en-CA", {
            style: "currency",
            currency: "CAD",
            maximumFractionDigits: 0,
          })}
        </p>
        <p
          className="bs-body italic mt-2 text-[0.9375rem]"
          style={{ color: "var(--ink-soft)" }}
        >
          That bought you a covid crash, two corrections, and seven years
          of paychecks.
        </p>
      </div>
    </section>
  );
}
