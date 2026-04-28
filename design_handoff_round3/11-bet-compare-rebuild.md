# 11 — Bet 02: `/compare` rebuilt as a behavioural document

**Milestone:** M3
**Effort:** Medium-High (~12 hours focused build, 1.5 days)
**Impact:** High
**Goal:** Replace the `/compare` page's spec-table-as-hero with a piece of editorial writing anchored in three real market events. The MER/AUM/Holdings table demotes below the fold.

This bet **subsumes** the `/compare` teardown (`20-teardown-compare.md`).

---

## The argument

"VEQT vs XEQT vs ZEQT" with five columns is a Wikipedia table. Every Canadian PFC blog has the same one. The reason this comparison is interesting is **not the MERs** (effectively identical) — it's how each fund **behaved** when something happened.

Three events are enough:
- **March 2020** — Covid crash
- **October 2022** — Rate-hike trough
- **August 2024** — Yen carry unwind

For each: drawdown, recovery time, one sentence on **why these funds diverged that week**.

Read `design-refs/Round2-Review-v2.html` "Bet 02" for the SVG mock and visual intent.

---

## Where it goes

**Page:** `app/compare/page.tsx` — restructure entirely.

**New components:**
- `components/compare/EventColumn.tsx` — one event, three funds, drawdown chart, anecdote
- `components/compare/EventHero.tsx` — wrapper rendering three EventColumns
- `components/compare/TiltComparison.tsx` — three stacked bars (US/CA/Dev/EM) for VEQT, XEQT, ZEQT

**Data:** `lib/data/compare-events-2026.json` — three events × three funds × daily closes around each event.

---

## Page structure (top to bottom)

```
1. Lead block
   h1: "Three funds. Three moments."
   h2: "The differences you can't see in a fact sheet." (italic, serif)
   Deck: 2-3 sentences setting up the thesis

2. EventHero (the Bet)
   Three columns side by side, each ~1/3 width on desktop

3. TiltComparison
   Three rows, stacked 100% bars, US/CA/Dev/EM
   Eyebrow: "What's inside each one"
   One-line caption: "Same world. Different weights."

4. Closing line
   "They hold the same world, weighted differently."
   (single sentence, large serif italic, centered, ~36px)

5. Spec sheet (demoted)
   Eyebrow: "If you came for the spec sheet..."
   The existing 5-column table (Ticker · MER · AUM · Holdings · Inception)
   Smaller type, less visual weight than the EventHero above
```

Lead → Hero → Tilt → Closing → Spec table. Five blocks, one column.

---

## EventColumn component

```tsx
interface EventColumnProps {
  date: string;             // "Mar 2020"
  title: string;            // "Covid crash"
  bottomDrawdown: number;   // -0.34
  recoveryDays: number;     // 142
  anecdote: string;         // "...the Canada tilt hurt."
  series: {
    veqt: PricePoint[];
    xeqt: PricePoint[];
    zeqt: PricePoint[];
  };
  highlightFund?: "VEQT" | "XEQT" | "ZEQT";  // default VEQT
}
```

### Layout

```
EYEBROW (sans, vermilion, 10px upper)   ← "MAR 2020"
TITLE (serif, 18px, ink, slight letter-spacing -0.01em)   ← "Covid crash"
[chart, full width, ~140×90 viewBox]
HORIZONTAL RULE (1px, var(--rule))
ANECDOTE (serif, 12px, ink-soft, leading 1.4)
   ← "VEQT fell 34%, recovered in 142 days. The Canada tilt hurt."
   "VEQT" is bolded vermilion to identify the highlighted line
```

### Chart

Hand-built SVG, 140×90 viewBox. Three lines:
- VEQT: `var(--stamp)`, stroke 2px, solid
- XEQT: `var(--ink-soft)`, stroke 1px, dashed `3 2`
- ZEQT: `var(--ink-mute)`, stroke 1px, dotted `2 1`

Two reference lines:
- 0% baseline at top: solid `var(--rule)`, 0.5px
- Trough drawdown: dashed `var(--rule)`, 0.5px, labeled with the drawdown % in mono on the left

X-axis is implicit (chronological); no labels needed (the eyebrow tells you the year).

Path data is computed from the daily closes. Window size: 90 trading days centered on the event start.

### Data shape per event

```json
{
  "id": "covid-2020",
  "date": "2020-03-23",
  "label": "Mar 2020",
  "title": "Covid crash",
  "anecdote": "VEQT fell 34%, recovered in 142 days. The Canada tilt hurt.",
  "highlightFund": "VEQT",
  "series": {
    "VEQT": [{ "d": "2020-02-19", "p": 1.000 }, ...],
    "XEQT": [...],
    "ZEQT": [...]
  },
  "drawdown": { "VEQT": -0.34, "XEQT": -0.33, "ZEQT": -0.36 },
  "recoveryDays": { "VEQT": 142, "XEQT": 138, "ZEQT": 151 }
}
```

Series are **normalized**: each fund's price at the start of the window = 1.000. This makes the three lines comparable on the same y-axis.

---

## TiltComparison component

```tsx
interface TiltComparisonProps {
  funds: {
    ticker: "VEQT" | "XEQT" | "ZEQT";
    weights: { us: number; ca: number; dev: number; em: number };
  }[];
}
```

Three rows, each:

```
[ticker, 80px, serif weight 600]  [stacked bar, flex-1, 12px tall]
                                  ┌──US─────┬─CA──┬─DEV───┬EM─┐
                                  │ 45%     │ 18% │ 25%   │12%│
                                  └─────────┴─────┴───────┴───┘
```

Same colors as the `TiltBar` from CL-08 — keep the legend consistent across the site:
- US: `var(--stamp)`
- CA: `var(--ink)`
- Dev: `var(--ink-mute)`
- EM: `var(--rule)`

Inline percentages on each segment if width allows; otherwise on hover/tap a small tooltip.

---

## Anecdote copywriting (drafts — refine)

The anecdotes are the soul of this page. They must be **specific** and **technically grounded**, not vague.

**Mar 2020:**
> VEQT fell 34% in 32 days. Canada was hit hardest of the four regions — energy and financials. XEQT held more US, less Canada — it lost a hair less. ZEQT had a slightly lower US weight and bottomed deeper.

**Oct 2022:**
> Twelve months of rate hikes carved 21% off VEQT's price. ZEQT fell less — its EM exposure was lighter and US growth got hit hardest. The recovery was a year and a half.

**Aug 2024:**
> The yen carry trade unwound on three days in early August. VEQT dropped 7.4%, recovered in 14 days. ZEQT lost more on day one — heavier Japan exposure — and recovered the slowest.

**These are starting points. Verify against actual price data before shipping.** If the data contradicts the narrative, change the narrative — never the data.

---

## Visual weight

- **Hero (EventColumns):** ~480px tall on desktop, takes the upper third of the page
- **TiltComparison:** ~180px, mid-page
- **Closing line:** ~120px breathing room
- **Spec table:** ~280px, smaller type than current, below the fold on 1366×768

The spec table should look **secondary** to the hero. Use smaller h2, tighter row height, no borders that compete with the hero's chart strokes.

---

## Data sourcing

Daily closing prices for VEQT.TO, XEQT.TO, ZEQT.TO around the three event windows. Roughly 90 trading days each → ~270 rows per fund × 3 funds = ~810 rows total.

Sources: Yahoo Finance, Stooq, or whatever the project's existing data layer uses (`lib/veqt-data.ts`?). If there's already daily-close infrastructure, **extend it**; don't introduce a parallel pipeline.

If hand-tabulating: 30 minutes per fund per event = 4.5 hours of CSV-to-JSON work. Acceptable.

---

## Acceptance criteria

- [ ] `/compare` route renders the new structure: Lead → Hero → Tilt → Closing → Spec table
- [ ] Three event columns render with normalized SVG charts
- [ ] Each column shows: date eyebrow, title, chart, drawdown line, anecdote
- [ ] TiltComparison renders three stacked bars in the same color legend as the home page TiltBar (CL-08)
- [ ] The closing line "They hold the same world, weighted differently." is large, italic serif, centered
- [ ] The original spec table is still on the page, but visibly smaller and secondary
- [ ] Anecdotes are technically accurate — drawdowns and recovery days match the data
- [ ] Mobile: columns stack vertically, charts shrink proportionally
- [ ] Builds and lints clean

---

## Out of scope

- No interactive scrubber on the charts (this is a *document*, not a tool)
- No "vs other ETFs not in this comparison" — three funds, three events, period
- No sector-level breakdown of the divergence — region tilt only
- No "what would have happened if you bought $10K at the trough" — that's the `/invest` page's job
