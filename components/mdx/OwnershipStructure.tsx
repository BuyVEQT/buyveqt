"use client";

const VANGUARD_RED = "#c4122f";
const BLACKROCK_BLUE = "#1a6dca";

function VanguardDiagram() {
  return (
    <svg
      viewBox="0 0 280 280"
      className="w-full max-w-[280px] mx-auto block"
      role="img"
      aria-label="Three concentric rings sharing one center: investors, funds, Vanguard Inc."
    >
      {/* Three concentric rings, all centered.
          Opacities tuned for legibility on light card background (#ffffff) — low opacities
          wash out against white but read fine on dark; bumped up to maintain visual hierarchy
          (outer is still relatively softer than inner) without losing edge definition in light mode. */}
      <circle cx={140} cy={140} r={120} fill="none" stroke={VANGUARD_RED} strokeWidth={2.5} opacity={0.65} />
      <circle cx={140} cy={140} r={80}  fill="none" stroke={VANGUARD_RED} strokeWidth={2.5} opacity={0.85} />
      <circle cx={140} cy={140} r={40}  fill="none" stroke={VANGUARD_RED} strokeWidth={2.5} opacity={1.0} />
      {/* Center dot — the single locus of ownership */}
      <circle cx={140} cy={140} r={4} fill={VANGUARD_RED} />

      {/* Labels positioned at the TOP of each band — between the outer arc of one ring and the inner ring inside it.
          Each label sits at the upper-vertical-axis where its band is widest and clear of curved strokes. */}
      {/* Outer band (between r=120 and r=80): top region from y=20 to y=60 */}
      <text
        x={140}
        y={36}
        fontSize={11}
        fontWeight={700}
        textAnchor="middle"
        fill="var(--color-text-primary)"
        style={{ letterSpacing: "0.06em" }}
      >
        INVESTORS
      </text>
      {/* Middle band (between r=80 and r=40): top region from y=60 to y=100 */}
      <text
        x={140}
        y={76}
        fontSize={11}
        fontWeight={700}
        textAnchor="middle"
        fill="var(--color-text-primary)"
        style={{ letterSpacing: "0.06em" }}
      >
        FUNDS
      </text>
      {/* Inner ring contents (inside r=40): place "VANGUARD" above the center dot.
          At y=124, inner-ring stroke crosses x=103/177 — text at fontSize 10 is ~50px wide, fits comfortably. */}
      <text
        x={140}
        y={127}
        fontSize={11}
        fontWeight={700}
        textAnchor="middle"
        fill={VANGUARD_RED}
        style={{ letterSpacing: "0.08em" }}
      >
        VANGUARD
      </text>
    </svg>
  );
}

function BlackRockDiagram() {
  // Cy=140 centers the diagram in the 280×280 viewBox (matches Vanguard's vertical center).
  // Left circle: cx=70, Right circle: cx=210 — symmetrical around x=140.
  return (
    <svg
      viewBox="0 0 280 280"
      className="w-full max-w-[280px] mx-auto block"
      role="img"
      aria-label="Two separate constituencies on either side of BlackRock Inc.: fund investors and BLK shareholders."
    >
      {/* Brackets above showing two distinct groups.
          Stroke and opacity bumped from 1/0.5 to 1.25/0.75 for light-mode legibility against #ffffff. */}
      <line x1={20}  y1={68} x2={120} y2={68} stroke={BLACKROCK_BLUE} strokeWidth={1.25} opacity={0.75} />
      <line x1={20}  y1={68} x2={20}  y2={78} stroke={BLACKROCK_BLUE} strokeWidth={1.25} opacity={0.75} />
      <line x1={120} y1={68} x2={120} y2={78} stroke={BLACKROCK_BLUE} strokeWidth={1.25} opacity={0.75} />
      <line x1={160} y1={68} x2={260} y2={68} stroke={BLACKROCK_BLUE} strokeWidth={1.25} opacity={0.75} />
      <line x1={160} y1={68} x2={160} y2={78} stroke={BLACKROCK_BLUE} strokeWidth={1.25} opacity={0.75} />
      <line x1={260} y1={68} x2={260} y2={78} stroke={BLACKROCK_BLUE} strokeWidth={1.25} opacity={0.75} />
      {/* Bracket caption — fontSize bumped 9 → 10, opacity removed for light-mode legibility */}
      <text x={70}  y={58} fontSize={10} fontWeight={700} textAnchor="middle" fill={BLACKROCK_BLUE} style={{ letterSpacing: "0.08em" }}>GROUP A</text>
      <text x={210} y={58} fontSize={10} fontWeight={700} textAnchor="middle" fill={BLACKROCK_BLUE} style={{ letterSpacing: "0.08em" }}>GROUP B</text>

      {/* Connecting line beneath the circles, drawn first so the center circle paints over its endpoints */}
      <line x1={120} y1={140} x2={160} y2={140} stroke={BLACKROCK_BLUE} strokeWidth={2.5} />

      {/* Left circle: Fund investors */}
      <circle cx={70}  cy={140} r={50} fill="none" stroke={BLACKROCK_BLUE} strokeWidth={2.5} />
      <text x={70} y={136} fontSize={11} fontWeight={600} textAnchor="middle" fill="var(--color-text-primary)">Fund</text>
      <text x={70} y={152} fontSize={11} fontWeight={600} textAnchor="middle" fill="var(--color-text-primary)">investors</text>

      {/* Right circle: BLK shareholders */}
      <circle cx={210} cy={140} r={50} fill="none" stroke={BLACKROCK_BLUE} strokeWidth={2.5} />
      <text x={210} y={136} fontSize={11} fontWeight={600} textAnchor="middle" fill="var(--color-text-primary)">BLK</text>
      <text x={210} y={152} fontSize={11} fontWeight={600} textAnchor="middle" fill="var(--color-text-primary)">shareholders</text>

      {/* Center bridge circle: BlackRock Inc. — opaque card-color fill so it sits clearly atop the bridge line.
          Filled with brand blue so it reads as the focal pivot between the two groups. */}
      <circle cx={140} cy={140} r={20} fill={BLACKROCK_BLUE} stroke={BLACKROCK_BLUE} strokeWidth={2.5} />
      <text x={140} y={144} fontSize={10} fontWeight={700} textAnchor="middle" fill="#ffffff" style={{ letterSpacing: "0.04em" }}>BLK</text>
      {/* Label callout below the entire row of circles (cy=140, r=50 → bottom at y=190; place at y=216 with clearance).
          fontSize bumped 10 → 11 for light-mode legibility. */}
      <text x={140} y={216} fontSize={11} fontWeight={700} textAnchor="middle" fill={BLACKROCK_BLUE} style={{ letterSpacing: "0.06em" }}>BLACKROCK INC.</text>
    </svg>
  );
}

export function OwnershipStructure() {
  return (
    <div className="my-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-10">
      {/* Header band */}
      <div className="mb-8 sm:mb-10">
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: VANGUARD_RED }}>
          Structural Difference
        </p>
        <h3 className="text-2xl sm:text-3xl font-serif text-[var(--color-text-primary)]">
          Same product. Different owners.
        </h3>
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-12">
        {/* Vanguard column */}
        <div className="text-center sm:text-left">
          <VanguardDiagram />

          <div className="mt-6">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-text-primary)]">
              Vanguard
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 mb-4">
              Investor-owned
            </p>
            <p className="text-base leading-relaxed text-[var(--color-text-primary)]">
              All concentric: same circle of people at every layer.
            </p>
            <div
              className="my-5 border-t border-[var(--color-border)] mx-auto sm:ml-0"
              style={{ width: "60px" }}
            />
            <p className="text-base sm:text-lg font-serif italic text-[var(--color-text-primary)]">
              <span className="font-bold not-italic" style={{ color: VANGUARD_RED }}>One</span> set of interests.
            </p>
          </div>
        </div>

        {/* BlackRock column */}
        <div className="text-center sm:text-left">
          <BlackRockDiagram />

          <div className="mt-6">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-text-primary)]">
              BlackRock
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 mb-4">
              Public company &middot; NYSE: BLK
            </p>
            <p className="text-base leading-relaxed text-[var(--color-text-primary)]">
              Two distinct groups: the company answers to both.
            </p>
            <div
              className="my-5 border-t border-[var(--color-border)] mx-auto sm:ml-0"
              style={{ width: "60px" }}
            />
            <p className="text-base sm:text-lg font-serif italic text-[var(--color-text-primary)]">
              <span className="font-bold not-italic" style={{ color: BLACKROCK_BLUE }}>Two</span> sets of interests.
            </p>
          </div>
        </div>
      </div>

      {/* Footer band — comparative fees, the financial anchor */}
      <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--color-text-muted)] mb-4">
          What this costs you
        </p>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm text-[var(--color-text-primary)]">
              Vanguard average expense ratio
            </p>
            <p className="font-bold tabular-nums text-base sm:text-lg" style={{ color: VANGUARD_RED }}>
              7 bps
            </p>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Industry average expense ratio
            </p>
            <p className="font-bold tabular-nums text-base sm:text-lg text-[var(--color-text-muted)]">
              44 bps{" "}
              <span className="text-xs font-normal text-[var(--color-text-muted)]">(approx. 6&times; more)</span>
            </p>
          </div>
        </div>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-4 italic">
          Source: Vanguard 2024 ownership disclosure
        </p>
      </div>
    </div>
  );
}
