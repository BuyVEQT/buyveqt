"use client";

type Event = {
  date: string;
  title: string;
  vanguardLed: boolean;
  delayFromPrev?: string;
};

const EVENTS: Event[] = [
  { date: "1976",     title: "First index fund",              vanguardLed: true  },
  { date: "2018",     title: "Asset-allocation ETFs (CA)",    vanguardLed: true  },
  { date: "Jan 2019", title: "VEQT launches",                 vanguardLed: true  },
  { date: "Aug 2019", title: "XEQT launches",                 vanguardLed: false, delayFromPrev: "↓ 7 months" },
  { date: "Nov 2025", title: "VEQT cuts to 0.17%",            vanguardLed: true  },
  { date: "Dec 2025", title: "XEQT matches at 0.17%",         vanguardLed: false, delayFromPrev: "↓ 30 days"  },
];

// Manual position percentages (0 to 1), tuned for visual balance
const POSITIONS: Record<string, number> = {
  "1976":     0.00,
  "2018":     0.50,
  "Jan 2019": 0.62,
  "Aug 2019": 0.68,
  "Nov 2025": 0.92,
  "Dec 2025": 0.97,
};

const VANGUARD_EVENTS = EVENTS.filter((e) => e.vanguardLed);
const INDUSTRY_EVENTS = EVENTS.filter((e) => !e.vanguardLed);

// Explicit pairings for mobile list: which industry event follows each Vanguard event?
// Key = Vanguard event date, value = Industry event date (or null = no response)
const MOBILE_PAIRS: Record<string, string | null> = {
  "1976":     null,
  "2018":     null,
  "Jan 2019": "Aug 2019",
  "Nov 2025": "Dec 2025",
};

// Convert 0–1 position to a left% value with a left-margin offset for the rail label
// The rail occupies roughly from 10% to 98% of the container width
function railLeft(pos: number): string {
  const pct = 10 + pos * 88;
  return `${pct}%`;
}

export function VanguardEffectTimeline() {
  return (
    <div className="my-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-10">
      {/* Header band */}
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: "#c4122f" }}>
          The Vanguard Effect
        </p>
        <h3 className="text-2xl sm:text-3xl font-serif text-[var(--color-text-primary)]">
          Vanguard moves first. Every time.
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-[60ch]">
          Each major shift in this product category was led by Vanguard. The industry has spent five decades responding.
        </p>
      </div>

      {/* Mobile-only: structured comparison list */}
      <div className="block sm:hidden space-y-5 mb-6">
        {VANGUARD_EVENTS.map((vEvent) => {
          const pairedDate = MOBILE_PAIRS[vEvent.date];
          const responseEvent = pairedDate
            ? INDUSTRY_EVENTS.find((ie) => ie.date === pairedDate)
            : undefined;
          return (
            <div key={vEvent.date} className="flex flex-col">
              <div className="flex items-start gap-3">
                <span
                  className="w-3 h-3 rounded-full mt-1 shrink-0"
                  style={{ background: "#c4122f" }}
                />
                <div>
                  <p
                    className="text-[11px] uppercase font-bold tracking-wider"
                    style={{ color: "#c4122f" }}
                  >
                    Vanguard · {vEvent.date}
                  </p>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {vEvent.title}
                  </p>
                </div>
              </div>
              {responseEvent && (
                <div
                  className="flex items-start gap-3 ml-6 mt-2 pt-2 border-l-2 pl-3"
                  style={{ borderColor: "#1a6dca" }}
                >
                  <span
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ background: "#1a6dca" }}
                  />
                  <div>
                    <p
                      className="text-[11px] uppercase font-bold tracking-wider"
                      style={{ color: "#1a6dca" }}
                    >
                      Industry · {responseEvent.date}
                      {responseEvent.delayFromPrev
                        ? ` (${responseEvent.delayFromPrev})`
                        : ""}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {responseEvent.title}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop-only: dual-rail visual */}
      <div className="hidden sm:block">
        {/* Time axis labels */}
        <div className="relative mb-1" style={{ paddingLeft: "10%" }}>
          {["1976", "2000", "2018", "2019", "2025"].map((y) => {
            const pos = POSITIONS[y] ?? (y === "2000" ? 0.27 : 0);
            return (
              <span
                key={y}
                className="absolute text-[10px] tabular-nums text-[var(--color-text-muted)]"
                style={{ left: `${10 + pos * 88}%`, transform: "translateX(-50%)" }}
              >
                {y}
              </span>
            );
          })}
          {/* Spacer so labels have room */}
          <div style={{ height: 16 }} />
        </div>

        {/* Rails container */}
        <div className="relative" style={{ height: 220 }}>
          {/* ── Vanguard rail ── */}
          <div className="absolute" style={{ top: 60, left: 0, right: 0 }}>
            {/* Rail label */}
            <div
              className="absolute text-[11px] font-bold uppercase tracking-[0.1em]"
              style={{ left: 0, top: -4, color: "#c4122f" }}
            >
              Vanguard
            </div>
            {/* Rail line */}
            <div
              className="absolute h-[2px]"
              style={{
                left: "10%",
                right: "2%",
                top: 5,
                background: "var(--color-border)",
              }}
            />
            {/* Vanguard event dots + labels */}
            {VANGUARD_EVENTS.map((e) => (
              <div
                key={e.date}
                className="absolute"
                style={{ left: railLeft(POSITIONS[e.date]), transform: "translateX(-50%)", top: 0 }}
              >
                {/* Dot */}
                <div
                  className="w-3 h-3 rounded-full mx-auto"
                  style={{ background: "#c4122f" }}
                />
                {/* Label above */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                  <p className="text-[11px] font-semibold text-[var(--color-text-primary)]">
                    {e.title}
                  </p>
                  <p className="text-[10px] tabular-nums text-[var(--color-text-muted)]">
                    {e.date}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Industry rail ── */}
          <div className="absolute" style={{ top: 150, left: 0, right: 0 }}>
            {/* Rail label */}
            <div
              className="absolute text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]"
              style={{ left: 0, top: -4 }}
            >
              Industry
            </div>
            {/* Rail line */}
            <div
              className="absolute h-[2px]"
              style={{
                left: "10%",
                right: "2%",
                top: 5,
                background: "var(--color-border)",
              }}
            />
            {/* Industry event dots + labels */}
            {INDUSTRY_EVENTS.map((e) => (
              <div
                key={e.date}
                className="absolute"
                style={{ left: railLeft(POSITIONS[e.date]), transform: "translateX(-50%)", top: 0 }}
              >
                {/* Dot */}
                <div
                  className="w-3 h-3 rounded-full mx-auto"
                  style={{ background: "#1a6dca" }}
                />
                {/* Label below */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                  <p className="text-[11px] font-semibold text-[var(--color-text-primary)]">
                    {e.title}
                  </p>
                  <p className="text-[10px] tabular-nums text-[var(--color-text-muted)]">
                    {e.date}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Delay connectors ── */}
          {INDUSTRY_EVENTS.filter((e) => e.delayFromPrev).map((e) => (
            <div
              key={`delay-${e.date}`}
              className="absolute"
              style={{
                left: railLeft(POSITIONS[e.date]),
                transform: "translateX(-50%)",
                top: 65,
                height: 80,
                width: 1,
              }}
            >
              {/* Dashed vertical line */}
              <div
                className="h-full mx-auto"
                style={{
                  width: 1,
                  borderLeft: "1px dashed #1a6dca",
                }}
              />
              {/* Delay label */}
              <div
                className="absolute left-2 text-[10px] font-semibold whitespace-nowrap"
                style={{ top: "30%", color: "#1a6dca" }}
              >
                {e.delayFromPrev}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-[var(--color-text-muted)] mt-1 italic">
          Time axis is illustrative, not strictly to scale.
        </p>
      </div>

      {/* Stat band footer */}
      <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--color-text-muted)]">
            Vanguard fee cuts since 1975
          </p>
          <p
            className="text-3xl sm:text-4xl font-bold tabular-nums"
            style={{ color: "#c4122f" }}
          >
            2,100<span className="text-2xl">+</span>
          </p>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2 italic">
          The pattern is named for them.
        </p>
      </div>
    </div>
  );
}
