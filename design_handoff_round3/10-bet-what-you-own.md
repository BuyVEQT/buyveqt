# 10 — Bet 01: The "What You Own" panel

**Milestone:** M2
**Effort:** Medium (~6 hours of focused build)
**Impact:** High
**Goal:** Add one ambitious home-page component that makes the contents of VEQT legible. Match the heatmap and price-chart-accordion in density and ambition.

---

## The argument

VEQT holds ~13,500 companies across the world. The site never shows you a single one of them. That's the most under-told fact about the fund. Round 3's home-page swing is to fix that with one component: a **HoldingsPanel** with a region treemap, a top-10 weights list, and one closing sentence that quantifies the long tail.

Read the strategic memo (`design-refs/Round2-Review-v2.html`, "Bet 01") for the inline SVG mock and visual intent.

---

## Where it goes

**File:** `components/broadsheet/HoldingsPanel.tsx`

**Mounted in:** `app/page.tsx`, between the region cards and the compare table. Approximately:

```
SeverityMeter
VolatilityHeatmap
EditionRecommends
RegionCards            ← existing
HoldingsPanel          ← NEW
CompareTable           ← existing (with Tilt column from CL-08)
LearnSyllabus
```

**Data:** `lib/data/holdings-2026-q1.json` — static snapshot from Vanguard's quarterly disclosure.

---

## Component shape

```tsx
"use client";  // only if tooltip/hover state is needed; otherwise server

interface HoldingsPanelProps {
  asOf: string;           // ISO date, e.g. "2026-03-31"
  regions: RegionWeight[]; // [{ name, code, weight, count }]
  topNames: TopName[];    // [{ ticker, name, weight, region }]
  totalNames: number;     // 13478
  longTail: {
    cutoffRank: number;   // 10
    cutoffWeight: number; // 0.131  (top 10 weight)
    tailNames: number;    // 13468
    tailWeight: number;   // 0.869
    headlineCount: number;// 3 (i.e., "Apple, Microsoft, Nvidia")
    headlineWeight: number;// 0.099
  };
}
```

The `longTail` block is what powers the closing sentence:

> *The bottom 13,468 holdings together weigh less than Apple, Microsoft and Nvidia combined.*

Compute this in the data file once, not in the component.

---

## Layout

Two-column on desktop (≥1024px), stacked on mobile.

```
┌─────────────────────────────────────────────────────────────────┐
│  EYEBROW (sans, mute)                                           │
│  Inside the ticker. 13,478 names.       (lead h3, serif)        │
│  Caption (italic serif, mute)                                   │
├──────────────────────────────────┬──────────────────────────────┤
│                                  │  TOP NAMES · WEIGHT          │
│      [Region treemap, 4 cells]   │  Apple    ████████  3.7%     │
│      US 45% · Dev 25% · CA 18%   │  Microsoft ███████  3.3%     │
│      · EM 12%                    │  Nvidia    ██████   2.9%     │
│                                  │  Amazon    ████     1.8%     │
│      Each cell: weight + ≈ name  │  RBC       ███      1.4%     │
│      count                       │  TD        ███      1.3%     │
│                                  │  ...       ...               │
│                                  │  …13,468 more  ████  86.9%   │
├──────────────────────────────────┴──────────────────────────────┤
│  THE LONG TAIL · The bottom 13,468 holdings together weigh      │
│  less than Apple, Microsoft and Nvidia combined.                │
└─────────────────────────────────────────────────────────────────┘
```

Total height target: ~440px desktop.

---

## Treemap details

**Algorithm:** Squarified treemap, but with **only 4 leaves** — you do not need a real treemap algorithm. Hand-position four `<rect>`s in an SVG that sum to the panel area, sized proportionally to weight.

**Layout (proportional):**
- US (45%) — left half, full height
- Dev-ex-US (25%) — right of US, top
- Canada (18%) — right of US, bottom
- EM (12%) — far right column, full height

Verify the rects sum to area = (region weight). For a 480×200 viewBox, that's:
```
US:      x=0,   y=0,  w=216, h=200   → 216×200 = 43,200 ≈ 45% × 96,000
Dev:     x=216, y=0,  w=160, h=120   → 19,200 ≈ 20% (close enough)
CA:      x=216, y=120,w=160, h=80    → 12,800 ≈ 13.3% (close enough)
EM:      x=376, y=0,  w=104, h=200   → 20,800 ≈ 21.7% (off — recompute)
```

**Recompute properly when implementing** with the real Q1 2026 weights. The above are illustrative.

**Colors:**
- US: `var(--stamp)` — this is a legitimate use; the largest holding region is "today's notable signal" in the sense of "the dominant fact"
- Dev-ex-US: `var(--ink-soft)` (#3a2f26 or whatever the token is)
- Canada: a darker red, `color-mix(in oklab, var(--stamp) 70%, var(--ink) 30%)` — establishes the "Canadian-tilt" relationship visually
- EM: `var(--ink-mute)`

**Labels in each cell:**
- Eyebrow (uppercase sans, paper color): `UNITED STATES`
- Big number (serif, paper): `45%`
- Italic note (serif italic, paper-deep): `≈ 6,100 names`

Use SVG `<text>` directly. No HTML overlay.

---

## Top names list

Right column, 6–8 rows max.

Each row: `[name, 80px] [bar, flex-1] [weight, 36px right-aligned]`

- Name: serif, 13px, ink
- Bar: 8px tall, `var(--paper-deep)` background, `var(--stamp)` fill at `weight / topWeight * 100%`
- Weight: tabular-nums, 13px, ink

**Last row** is the long-tail row, visually distinct:
- Name: italic, ink-mute: `…13,468 more`
- Bar: `var(--ink-mute)` fill at `tailWeight / topWeight * 100%` (will exceed 100% — clamp to 100%)
- Weight: ink-mute, e.g. `86.9%`

---

## The long-tail sentence

Bottom strip, separated by a `border-t border-[color:var(--ink)]`, ~14px serif italic, ink-soft text.

```
THE LONG TAIL.  The bottom 13,468 holdings together weigh less
than Apple, Microsoft and Nvidia combined.
```

`THE LONG TAIL.` is sans, uppercase, vermilion, 10px, letter-spaced — using `bs-stamp` is **fine here** because it's marking the headline-of-the-headline (the most striking fact). This is the rule's intended use.

The numbers (`13,468`, `Apple, Microsoft and Nvidia`) are **derived from the data**, not hardcoded in the JSX. Compute in the data file or in a small helper.

---

## Data file shape

`lib/data/holdings-2026-q1.json`:

```json
{
  "asOf": "2026-03-31",
  "totalNames": 13478,
  "regions": [
    { "name": "United States",     "code": "US",  "weight": 0.450, "count": 6100 },
    { "name": "Developed ex-US",   "code": "DEV", "weight": 0.250, "count": 4200 },
    { "name": "Canada",            "code": "CA",  "weight": 0.180, "count": 200  },
    { "name": "Emerging Markets",  "code": "EM",  "weight": 0.120, "count": 3000 }
  ],
  "topNames": [
    { "ticker": "AAPL",  "name": "Apple",     "weight": 0.037, "region": "US" },
    { "ticker": "MSFT",  "name": "Microsoft", "weight": 0.033, "region": "US" },
    { "ticker": "NVDA",  "name": "Nvidia",    "weight": 0.029, "region": "US" },
    { "ticker": "AMZN",  "name": "Amazon",    "weight": 0.018, "region": "US" },
    { "ticker": "RY.TO", "name": "RBC",       "weight": 0.014, "region": "CA" },
    { "ticker": "TD.TO", "name": "TD",        "weight": 0.013, "region": "CA" }
  ]
}
```

**Source:** Cross-reference Vanguard's official quarterly holdings PDF and BlackRock's iShares disclosures. Numbers above are **placeholder**; re-derive from the most recent factsheet at implementation time.

A `lib/holdings.ts` helper computes `longTail`:

```ts
export function computeLongTail(d: HoldingsData) {
  const topWeight = d.topNames.reduce((s, n) => s + n.weight, 0);
  const headlineNames = d.topNames.slice(0, 3);
  const headlineWeight = headlineNames.reduce((s, n) => s + n.weight, 0);
  return {
    cutoffRank: d.topNames.length,
    cutoffWeight: topWeight,
    tailNames: d.totalNames - d.topNames.length,
    tailWeight: 1 - topWeight,
    headlineCount: 3,
    headlineWeight,
    headlineNames: headlineNames.map(n => n.name),
  };
}
```

---

## Acceptance criteria

- [ ] `HoldingsPanel` renders on the home page between region cards and the compare table
- [ ] Treemap is a single SVG, four cells, proportional to weight, labeled inline
- [ ] Top-names list shows 5–6 actual top holdings + the synthesized "…13,468 more" row
- [ ] The long-tail sentence is computed, not hardcoded
- [ ] Component is keyboard-focusable; treemap cells have `<title>` for screenreaders
- [ ] On mobile, columns stack: treemap on top, top-names below
- [ ] No new design tokens; uses existing `--stamp`, `--ink`, `--paper`, `--paper-deep`, `--ink-soft`, `--ink-mute`, `--rule`
- [ ] Builds clean, lints clean
- [ ] Visual diff matches the SVG mock in `design-refs/Round2-Review-v2.html` "Bet 01" section

---

## Out of scope

- No drill-down on click. The treemap is a visualization, not navigation.
- No tooltip on hover. The labels are inline.
- No live data feed. Static JSON, hand-updated quarterly.
- No sector breakdown (yet). That's a future component.
