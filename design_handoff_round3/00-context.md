# 00 — Context

Read this first. It tells Claude Code what's already in the repo, what's working, and what to leave alone.

---

## The site, in one paragraph

`buyveqt-main` is an editorial-style website about **VEQT** (Vanguard's all-equity ETF, ticker VEQT.TO on the TSX). It treats VEQT not as a product to sell but as a **subject of editorial coverage** — a daily "broadsheet" with a live-wire price stamp, a 90-day volatility heatmap, a price chart with annotated drawdowns, and rotating dispatches. The visual language is **cream paper, ink, vermilion accents, serif display + sans UI + mono numerals**. The brand reference is *Financial Times / Bloomberg / The Economist*, not *Robinhood*.

## Stack

- **Next.js 15** (app router)
- **React 19**
- **TypeScript** strict
- **Tailwind v4** with extensive custom CSS in `app/globals.css`
- **No external chart library** — charts are hand-built SVG (continue this pattern)
- **No state management library** — local `useState` and one `useVeqtData` hook in `lib/`

## What shipped in Round 2 (keep these)

| Component | File | What it does |
|---|---|---|
| `Masthead` | `components/broadsheet/Masthead.tsx` | Single-row chrome, live-wire stamp tied to `isMarketOpen()`, "After Hours" label off-hours |
| `EditionRecommends` | `components/broadsheet/EditionRecommends.tsx` | Severity-keyed sentence + one underlined link, no box, no button |
| `VolatilityHeatmap` | `components/broadsheet/VolatilityHeatmap.tsx` | 90-day grid, tooltip pinning on touch, dispatch-link integration, deep-link to `/inside-veqt#heatmap` |
| `SeverityMeter` | `components/broadsheet/SeverityMeter.tsx` | Gauge showing how unusual today's move is. **Currently used once on the home page only.** |
| `PriceChart` accordion | (within home) | The other "swing" component from Round 2 — annotated chart with expandable analysis. |
| Plain-noun nav | `Masthead.tsx` | `Calculators · Compare · Learn · Inside VEQT · Community` |
| `audit.md` pattern | repo root | An inventory pass before any multi-file refactor. **Keep this pattern; redo it at the start of each milestone.** |

## What slipped in Round 2 (the cleanup PR fixes these)

These are the loose threads that `01-cleanup-pr.md` addresses. Listed here so Claude Code knows what's broken before going in:

- `HeroSection.tsx` is **unimported but still on disk**.
- `.card-editorial`, `.hero-gradient`, `.section-label` blocks **still in `globals.css`** (around lines 138, 200, 271).
- **9 components still import `card-editorial`** — `InvestCalculator`, `ChartSidebar`, `InsideVeqtPreview`, `ComparePreview`, `LearnPreview`, `PriceChart`, `CalculatorsPreview`, plus two more.
- **Italics overused** — `bs-display-italic` appears 22 times across 10 page files. Target is ≤2/page (lead headline only).
- **Vermilion overused** — `var(--stamp)` is on every section label, drop-cap, hover, and the inception calculator `$`. It should mark *today's notable signal* only.
- **No Tilt column** on the home compare table at `app/page.tsx:307`. The CSS scaffolding `.bs-tilt-bar` exists at `globals.css:1300` but isn't rendered.
- **Home /learn block is wrong shape** — still `LEARN_ARTICLES.map(...)` at `app/page.tsx:381`, supposed to be Step 1 / Step 2 / Step 3 hardcoded triplet.
- **Severity Meter renders once.** No `compact` prop. Plan asked for it on `/learn/veqt-is-down` and `/invest`.

## What to leave alone

- `Masthead.tsx` — works, do not redesign
- `VolatilityHeatmap.tsx` — works above spec, do not refactor
- `EditionRecommends.tsx` — works, do not change copy without asking
- `app/globals.css` design tokens (the `:root` block) — do not add new colors
- The **broadsheet visual language** as a whole — cream/ink/vermilion/serif. Don't introduce gradient backgrounds, rounded-corner+left-accent cards, generic "fintech" UI.

## What "done" means for Round 3

By the end of M1–M4 above:

1. The home page has **one new ambitious component** (`HoldingsPanel`) that matches the heatmap and price-chart-accordion in density and ambition.
2. `/compare` is a **piece of writing**, not a spec sheet — three event columns above the fold, MER table demoted below.
3. `/invest` calculators output a **cohort fan** instead of a single number.
4. `/learn` is **three named courses** of three reads each, with the archive below.
5. `/history` exists as a **new route**, a single scroll-locked horizontal timeline of seven years of one ticker.
6. The Round 2 loose threads (italics, vermilion, dead CSS, severity reuse) are **fully resolved**.
