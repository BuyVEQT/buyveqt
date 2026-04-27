# Round 2 — Task 0 Audit

Snapshot of the codebase before any Round 2 changes are applied. Scope:
imports of `Masthead`, `HeroSection`, `RegionCards`, `SeverityMeter`; the
`Masthead` variant rendered by each route; current top-level routes; and
the `HeroSection` dead-code gate for Task 3.

## 1. Importers of the four target components

Grouped by component. Path · line of `import` · line(s) where the symbol
is rendered or referenced.

### `Masthead` (`components/broadsheet/Masthead.tsx`)

- [app/page.tsx:7](app/page.tsx:7) — imports `Masthead`; renders at [app/page.tsx:98](app/page.tsx:98) (no `variant` prop → defaults to `"home"`).
- [components/broadsheet/InteriorShell.tsx:5](components/broadsheet/InteriorShell.tsx:5) — imports `Masthead`; renders at [components/broadsheet/InteriorShell.tsx:40](components/broadsheet/InteriorShell.tsx:40) with `variant="interior"`.

### `HeroSection` (`components/HeroSection.tsx`)

- **No external importers.** The symbol appears only inside its own file: the `HeroSectionProps` interface at [components/HeroSection.tsx:11](components/HeroSection.tsx:11) and the default export at [components/HeroSection.tsx:80](components/HeroSection.tsx:80). `grep -r HeroSection` across `app/`, `components/`, `lib/` returns the single file.

### `RegionCards` (`components/broadsheet/RegionCards.tsx`)

- [app/page.tsx:8](app/page.tsx:8) — imports `RegionCards`; renders at [app/page.tsx:166](app/page.tsx:166).
- [lib/useRegions.ts:34](lib/useRegions.ts:34) — **comment-only mention** in the JSDoc for `useRegions`; not an import.

### `SeverityMeter` (`components/broadsheet/SeverityMeter.tsx`)

- [app/page.tsx:11](app/page.tsx:11) — imports `SeverityMeter`; renders at [app/page.tsx:143](app/page.tsx:143).

## 2. Routes → `Masthead` variant rendered

Every `app/**/page.tsx` and the masthead variant it produces. Pages that
use `InteriorShell` inherit `variant="interior"` from
[components/broadsheet/InteriorShell.tsx:40](components/broadsheet/InteriorShell.tsx:40).

| Route                    | File                                                                   | Variant     | How                          |
|--------------------------|------------------------------------------------------------------------|-------------|------------------------------|
| `/`                      | [app/page.tsx](app/page.tsx)                                           | `home`      | direct `<Masthead>` (default) |
| `/calculators`           | [app/calculators/page.tsx](app/calculators/page.tsx)                   | _none_      | server redirect to `/invest` |
| `/community`             | [app/community/page.tsx](app/community/page.tsx)                       | `interior`  | `InteriorShell`              |
| `/compare`               | [app/compare/page.tsx](app/compare/page.tsx)                           | `interior`  | `InteriorShell`              |
| `/compare/[slug]`        | [app/compare/[slug]/page.tsx](app/compare/[slug]/page.tsx)             | `interior`  | `InteriorShell`              |
| `/distributions`         | [app/distributions/page.tsx](app/distributions/page.tsx)               | `interior`  | `InteriorShell`              |
| `/inside-veqt`           | [app/inside-veqt/page.tsx](app/inside-veqt/page.tsx)                   | `interior`  | `InteriorShell`              |
| `/invest`                | [app/invest/page.tsx](app/invest/page.tsx)                             | `interior`  | `InteriorShell`              |
| `/learn`                 | [app/learn/page.tsx](app/learn/page.tsx)                               | `interior`  | `InteriorShell`              |
| `/learn/[slug]`          | [app/learn/[slug]/page.tsx](app/learn/[slug]/page.tsx)                 | `interior`  | `InteriorShell` (max-w-1200) |
| `/learn/path/[id]`       | [app/learn/path/[id]/page.tsx](app/learn/path/[id]/page.tsx)           | `interior`  | `InteriorShell`              |
| `/methodology`           | [app/methodology/page.tsx](app/methodology/page.tsx)                   | `interior`  | `InteriorShell`              |
| `/weekly`                | [app/weekly/page.tsx](app/weekly/page.tsx)                             | `interior`  | `InteriorShell`              |
| `/weekly/[slug]`         | [app/weekly/[slug]/page.tsx](app/weekly/[slug]/page.tsx)               | `interior`  | `InteriorShell` (max-w-1200) |

## 3. Top-level routes — one-line description

Sourced from each page's `metadata.description` (or first paragraph of
copy where no metadata exists).

- **`/`** — Homepage. Live VEQT broadsheet: lead headline computed from today's move, severity meter, region cards, marquee article, and editorial sections.
- **`/calculators`** — Server redirect to `/invest`. No content of its own.
- **`/community`** — _The Forum — r/JustBuyVEQT._ Curated subreddit links and community resources for VEQT investors.
- **`/compare`** — _The Bouts — VEQT vs the field._ Head-to-head comparisons of VEQT against XEQT, VGRO, and other Canadian asset-allocation ETFs.
- **`/compare/[slug]`** — Per-pairing comparison page (e.g. VEQT vs XEQT) with full structural analysis.
- **`/distributions`** — _The Annual — VEQT Distribution History & Income._ Distribution history table, yield trends, and income context.
- **`/inside-veqt`** — _Inside VEQT — Holdings, Sectors & Geographic Allocation._ "What's inside VEQT? Explore the 4 underlying ETFs, top 15 holdings, sector breakdown, and geographic allocation of Vanguard's all-equity ETF."
- **`/invest`** — _The Reckoner — VEQT Calculators._ Lump-sum, DCA, dividend, account, and FIRE calculators with shareable result OGs.
- **`/learn`** — _Learn — VEQT & Canadian Passive Investing._ Plain-English dispatches on VEQT, Canadian ETFs, tax-advantaged accounts, and building a passive portfolio.
- **`/learn/[slug]`** — Individual learn article (MDX-rendered).
- **`/learn/path/[id]`** — Curated multi-article reading path.
- **`/methodology`** — _The Colophon — Sources, Methods, Fine Print._ Where prices come from, refresh cadence, manual data, editorial process.
- **`/weekly`** — _The Wire — VEQT Week-by-Week Recaps._ Weekly recap index.
- **`/weekly/[slug]`** — Individual weekly recap.

## 4. `HeroSection` dead-code gate (for Task 3)

**Verdict: dead code. Safe to delete in Task 3.**

- Repository-wide search (`grep -r HeroSection --include="*.tsx" --include="*.ts" .`) returns exactly one file: [components/HeroSection.tsx](components/HeroSection.tsx).
- Only matches inside that file are the `HeroSectionProps` interface declaration ([components/HeroSection.tsx:11](components/HeroSection.tsx:11)) and the default export ([components/HeroSection.tsx:80](components/HeroSection.tsx:80)).
- No tests reference it (`**/HeroSection*` glob: only the source file).
- No OG-image generation route imports it.
