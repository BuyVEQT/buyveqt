# 21 — Teardown: `/invest` (calculators)

**Milestone:** M3
**Effort:** Medium (~8 hours)
**Goal:** Reframe both calculators from "single-number output" to **cohort fan charts**. Same inputs, very different output.

---

## The argument

The current calculators ("if I had invested $X in 2019…" and "if I invest $Y/month for Z years…") output a single cumulative number. Useful for ego, useless for understanding. There's no distribution, no worst case, no sequence-of-returns intuition.

Reframe both as **"what actually happened to people who started in…"** — a fan chart of all rolling cohorts, with the user's scenario highlighted.

---

## Where it goes

**Page:** `app/invest/page.tsx`
**Component:** `components/invest/CohortFan.tsx` (new), replacing the current single-number output panels
**Component to keep:** The input form (sliders, fields). The output side is what's changing.

---

## The new output

### For the lump-sum calculator

User inputs: `$X, started in <month>` (e.g. `$10,000, started March 2020`).

Output:

```
HEADLINE
You started in March 2020. $10,000 is now $24,310.

FAN CHART
[84 light grey lines, each one cohort that started in a different month
since launch (Jan 2019 to today). User's cohort highlighted in vermilion.]

THREE NUMBERS
Median outcome of all cohorts:    $19,400
YOUR outcome:                     $24,310
Worst-case cohort (Feb 2022):     $13,100

ONE SENTENCE
"71 of 84 cohorts did better than yours; 13 did worse."
```

(Or "you did better than 84% of all start dates", etc.)

### For the DCA calculator

User inputs: `$Y/month, for Z years, starting <month>`.

Output: same structure. Fan of all `Z`-year cohorts that started in different months. User's cohort highlighted. Median, user, worst-case.

---

## CohortFan component

```tsx
interface CohortFanProps {
  mode: "lumpsum" | "dca";
  startDate: string;       // user's chosen start
  amount: number;          // initial $ for lumpsum, monthly $ for DCA
  durationMonths: number;  // for DCA only
  // computed by parent:
  cohorts: Cohort[];       // every monthly cohort since launch
  userCohort: Cohort;      // the one matching user's startDate
}

interface Cohort {
  startDate: string;
  finalValue: number;
  // optionally: full path for plotting
  path?: { d: string; v: number }[];  // monthly value over time, normalized
}
```

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│  HEADLINE (lead h2, italic on the verb)                       │
│  You started in March 2020. $10,000 is now $24,310.           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   [Fan chart, ~480x300, 84 grey lines + 1 vermilion]          │
│                                                                │
│   x-axis: months from start (0 to durationMonths)             │
│   y-axis: portfolio value, log or linear depending on data    │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  3-COLUMN STAT STRIP                                          │
│  Median  │  Your cohort  │  Worst case                         │
│  $19,400 │  $24,310      │  $13,100                            │
│  median  │  vermilion,   │  ink-mute, italic                   │
│          │  bold, large  │                                     │
├────────────────────────────────────────────────────────────────┤
│  ONE SENTENCE                                                  │
│  Italic serif, ink: "71 of 84 cohorts did better than yours;  │
│  13 did worse."                                                │
└────────────────────────────────────────────────────────────────┘
```

### Fan chart details

- All cohort lines: `var(--rule)` stroke, 0.5px, opacity 0.5
- User's cohort: `var(--stamp)`, 2px, full opacity
- Median path: `var(--ink)`, 1px, dashed `4 2`, drawn on top of the grey lines
- Y-axis: tabular-nums, mono, ink-mute. Plot points formatted as `$X,XXX`
- X-axis: month labels, mono, ink-mute. "Month 0" at left, e.g. "Month 84" at right
- No grid. Two horizontal hairlines at the user's start value and end value.

---

## Computation

For each month from launch to today:

```
LUMP-SUM cohort starting at month M:
  finalValue = amount * (priceToday / priceAt[M])

DCA cohort starting at month M, durationMonths D:
  finalValue = sum over each monthly contribution k from 0 to D-1:
    amount * (priceAtMonth[M + D] / priceAt[M + k])
  Where M + D ≤ today (otherwise cohort hasn't completed yet — exclude or extrapolate)
```

This is straightforward arithmetic on the daily-close series. Implement as a pure function `lib/calculators.ts`:

```ts
export function computeCohorts(
  mode: "lumpsum" | "dca",
  amount: number,
  durationMonths: number,
  series: PricePoint[]
): Cohort[] { ... }
```

Test it.

---

## Severity Meter on this page

Per CL-06, mount `<SeverityMeter compact />` above the calculator output. Compact format: ~80px strip, gauge + current severity word.

This connects the home page's most-used component to a related context: *"today's market is scary; here's what other people who started during scary days actually got."*

---

## Acceptance criteria

- [ ] Both calculators (lump-sum and DCA) output fan charts, not single numbers
- [ ] User's cohort renders distinctly (vermilion, 2px) above all other cohort lines
- [ ] Three-number stat strip below the chart: median, user, worst-case
- [ ] One-sentence summary states user's percentile rank
- [ ] `<SeverityMeter compact />` renders above the calculator (per CL-06)
- [ ] Computation is correct — verify median, user, and worst-case against a hand-computed example
- [ ] Mobile: fan chart shrinks; stat strip stacks
- [ ] No external charting library; SVG hand-built
- [ ] Builds, lints, types clean

---

## Out of scope

- No optimizer ("when should I have started instead?") — interesting but a separate feature
- No tax/RRSP/TFSA modeling — out of scope for this round
- No comparison with XEQT/ZEQT — VEQT only, this is its calculator
- No projections forward — historical cohorts only
