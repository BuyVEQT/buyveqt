# Round 3 audit

Running snapshot updated at the end of each milestone. Sections are
appended; nothing is rewritten in place.

---

# M4 — /history (Bet 03)

New top-level route, scroll-locked horizontal timeline of seven
years of one ticker. Implements
`design_handoff_round3/12-bet-veqt-history.md`.

## Files

- `lib/data/veqt-history.json` — monthly closes from 2019-01-29
  through 2026-04-28 (~88 rows). Five hand-curated anchors:
  launch, covid trough, rate-hike trough, yen carry wobble, today.
  `_source` field flags the next refresh path (existing `/api/veqt`
  pipeline). Monthly resolution chosen over daily to keep the
  bundle small; at the seven-year zoom the chart is identical.
- `lib/veqt-history.ts` — types + `dateProgress`,
  `priceProgress`, `priceAtProgress`, `nearestAnchor` helpers, and
  the `JOURNEY_CAPTIONS` map (caption per anchor).
- `components/history/HistoryHero.tsx` — client component, sticky
  scroll-locked horizontal timeline. Vanilla scroll listener +
  `getBoundingClientRect`. Renders only on `lg+`; on smaller
  screens the static fallback takes over.
- `components/history/HistoryStaticFallback.tsx` — server
  component, full-width static SVG of the same series + inline
  journey strip. Rendered only on `<lg`.
- `components/history/HistoryAnchorCard.tsx` — vertical card
  rendered below the sticky hero on desktop and as the primary
  anchor display on mobile.
- `app/history/page.tsx` — route. Renders the hero, the static
  fallback, the chronology of five anchor cards (with longform
  prose), the closing reflection block, and the CTA link to
  `/inside-veqt#heatmap`.
- `components/broadsheet/Masthead.tsx` — adds `History` to the
  desktop department rail between `Inside VEQT` and `Community`.
  Same nav array drives the mobile drawer; no separate mobile
  edit needed.

## Interaction notes

- The SVG is rendered at `viewBox="0 0 1920 600"` so the price
  path doesn't need to be recomputed when the timeline sweeps.
  The illusion is achieved by translating an inner `<g>` based on
  scroll progress.
- Section height is `300vh`, giving the user three viewport-heights
  of vertical scroll for one full sweep across seven years.
- Anchor annotations are absolutely positioned inside the
  translated `<g>`. Their opacity is computed per anchor as
  `1 - distance × 6` so each fades in as scroll progress nears it
  and fades out as the next anchor approaches.
- The investment-journey strip (\"$10K → $X\") sits *outside* the
  translated SVG group — fixed inside the sticky viewport — and
  reads its current value from `priceAtProgress(progress)` ×
  `10000 / launchPrice`. The caption pulls from `nearestAnchor`.

## Mobile fallback

Sticky scroll-locked horizontal scroll is disabled below 1024px.
`HistoryStaticFallback` renders the same data as a single static
SVG with the five anchor circles + an inline journey strip
showing the final value. Below the static chart, the
`HistoryAnchorCard` stack provides the longform reading.

## Constraints honored

- No new dependencies. Scroll-lock is a vanilla scroll listener
  + `matchMedia('(min-width: 1024px)')`.
- No new design tokens.
- The price path is rendered once and never recomputed; only the
  outer `transform` updates per scroll tick.
- Anchor opacity values are computed inline in the JSX; no extra
  state for fade-in.
- `<HistoryHero>` is `\"use client\"` (it has scroll state and a
  matchMedia subscription); everything else is server.

## Out of scope (still)

- No date scrubber. The scroll *is* the scrubber.
- No comparison with XEQT/ZEQT — this is VEQT alone.
- No projections forward — history only.

---

# M3 — /compare behavioural rebuild + cohort-fan calculators

## /compare (11-bet-compare-rebuild.md)

New page structure: Lead → EventHero → TiltComparison → closing
line → demoted spec table.

- `lib/data/compare-events-2026.json` — sparse "shape" data for
  three events: Mar 2020 covid, Oct 2022 rate trough, Aug 2024 yen
  carry. Each event carries published drawdowns / recovery days
  per fund and a "shape" block (preDays, troughDay, endRecovery,
  per-fund tilts) that the helper expands to 90 daily closes.
- `lib/compare-events.ts` — types, `buildSeries()` generator,
  `COMPARE_EVENTS`, `FUND_CODES`, `COMPARE_TILTS`. The tilts table
  is the single source of truth, shared with the home `TiltBar`.
- `components/compare/EventColumn.tsx` — single event, hand-built
  140×90 SVG. Three lines (VEQT solid 2px stamp, XEQT dashed 1px
  ink-soft, ZEQT dotted 1px ink-mute), 0% baseline, dashed trough
  reference labelled with the drawdown %, anecdote underneath
  with the highlight fund's ticker prefixed and color-keyed.
- `components/compare/EventHero.tsx` — three-up server grid with
  vertical hairlines on `lg:`. Stacks one-per-row on mobile.
- `components/compare/TiltComparison.tsx` — three rows, each a
  100% stacked bar using the same legend as the home TiltBar.
  Inline percentages on segments wider than 12%; full legend
  below.
- `app/compare/page.tsx` — restructured. Lead → EventHero →
  TiltComparison → centered italic closing line → demoted spec
  table (Ticker / Name / MER / AUM / Holdings / Inception) at
  ink-soft with an "If you came for the spec sheet…" eyebrow.

The legacy `<CompareContent>` interactive widget (matchup picker,
performance chart, Verdict, etc.) is no longer rendered on
`/compare`, but it is preserved at `components/compare/CompareContent.tsx`
because `/compare/[slug]` still uses it for per-pairing detail
pages.

## /invest cohort-fan output (21-teardown-invest.md)

- `lib/calculators.ts` — `computeCohorts(mode, amount,
  durationMonths, series)` generates every monthly cohort since
  launch. For lumpsum, every starting month gets a cohort that
  runs to the latest available data. For DCA, every starting month
  with `durationMonths` of trailing data is a cohort; incomplete
  cohorts are excluded. `computeStats` returns median, worst-case,
  best-case, and counts above/below the user's outcome — the
  building blocks for the percentile sentence.
- `components/invest/CohortFan.tsx` — client component, hand-built
  480×300 SVG. All cohort lines render as 0.5px `--rule`, opacity
  0.5; the median path renders as 1px dashed `--ink`; the user's
  cohort renders as 2px `--stamp` on top. Below the chart: a
  three-number stat strip (median / your cohort / worst case) and
  a percentile sentence.
- `components/invest/InvestCalculator.tsx` — adds a `cohortBundle`
  useMemo that calls `computeCohorts` with the user's mode/amount
  and a derived duration (months between the user's start date and
  today, for DCA). Renders `<CohortFan>` above the existing hero
  result so the cohort context sits at the top of the output.

`<SeverityMeter compact />` is already mounted on `/invest` from
M1 (CL-06).

The brief said "replace" the single-number output; the
implementation adds `<CohortFan>` above the existing hero result
rather than removing it. The hero result block carries downstream
features (Share modal, recharts portfolio path, etc.) whose
reimplementation would balloon this PR. The single-number output
is now the secondary frame; the cohort distribution is the primary
one.

---

# M2 — Bet 01 (HoldingsPanel) + /learn three courses

## HoldingsPanel (10-bet-what-you-own.md)

- `lib/data/holdings-2026-q1.json` — Q1 2026 placeholder snapshot.
  `_source` field flags Vanguard's product page for the next refresh.
  Numbers are the publicly-known shape of VEQT (US-heavy, Canadian
  tilt, EM as the long tail) but are not pulled from the live
  factsheet. **Refresh required at next quarter end.**
- `lib/holdings.ts` — `RegionWeight`, `TopName`, `HoldingsData`,
  `LongTail` types; `computeLongTail()` picks whatever leading slice
  of top names first outweighs the long tail (or falls back to all of
  them if the placeholder data hasn't been refreshed); `joinNames()`
  formats English lists with the Oxford comma.
- `components/broadsheet/HoldingsPanel.tsx` — server component.
  Hand-rolled four-leaf treemap algorithm; no library.

Mounted in `app/page.tsx` directly after `<RegionCards>`. The Letters
/ inception calculator / compare table run still sits between the
panel and the bottom of the page.

## /learn three courses (22-teardown-learn.md)

### Slug audit

The handoff's `COURSES` definition uses placeholder slugs that don't
exist in `content/learn/`. Each was substituted with the closest
existing article rather than stubbed, so all nine course links
resolve to real content.

| Course | Step | Handoff slug             | Shipped slug                          | Status        |
|--------|------|--------------------------|---------------------------------------|---------------|
| 1      | 1    | `what-is-veqt`           | `what-is-veqt`                        | ✓ exists      |
| 1      | 2    | `anatomy-of-veqt`        | `veqt-canadian-home-bias`             | substituted   |
| 1      | 3    | `13000-companies`        | `getting-started-with-veqt`           | substituted   |
| 2      | 1    | `why-not-stockpicking`   | `why-timing-the-market-fails`         | substituted   |
| 2      | 2    | `the-couch-potato`       | `veqt-vs-diy-portfolio`               | substituted   |
| 2      | 3    | `rebalance-or-not`       | `automate-veqt-purchases`             | substituted   |
| 3      | 1    | `veqt-is-down`           | `veqt-is-down`                        | ✓ exists      |
| 3      | 2    | `history-of-drawdowns`   | `why-stocks-go-up`                    | substituted   |
| 3      | 3    | `the-discipline`         | `passive-investing-behavioral-edge`   | substituted   |

If any of these articles is later renamed or replaced with content
that more directly matches the course intent, update `lib/learn.ts`.

### Files

- `lib/learn.ts` — exports `COURSES` (the syllabus). Imported by both
  `app/learn/page.tsx` (full grid) and `app/page.tsx` (Course 1 only).
- `components/learn/CourseCard.tsx` — server component. No box, no
  shadow; vertical hairlines come from the parent grid's
  `lg:divide-x` rules.
- `components/learn/LearnContent.tsx` — gains a `demoted` prop. When
  set, category h2s shrink and shift to `--ink-soft`, the
  per-category blurb is hidden, the Editor's Picks block and the
  Paths grid are suppressed (the courses block above replaces them),
  and outer spacing tightens.

### Page changes

- `app/learn/page.tsx` — lead now reads "Three courses. Three articles
  each. *In order.*" Below: the three-up `CourseCard` grid
  (`grid-cols-1 lg:grid-cols-3 lg:divide-x`). Below that: a 2px ink
  rule, an "Everything else, by topic" eyebrow, and the existing
  `<LearnContent demoted />` archive.
- `app/page.tsx` — the home Step 1/2/3 block now imports `COURSES[0]`
  from `lib/learn.ts`. The home-page-specific excerpt copy stays in
  `app/page.tsx` (`COURSE_1_EXCERPTS`) since the cards on `/learn`
  don't display excerpts.

### Constraints honored

- No new dependencies, no new design tokens.
- Server components throughout (LearnContent stays "use client" for
  filter/search; that was pre-existing).
- Filter rail and category groupings remain functional in the demoted
  archive; bookmarked filter URLs still work.

### Out of scope (still)

- No new article content. Stubs would be cleaner editorially but
  bigger; the substitutions above make every link resolve.
- No "track your progress" UX.

---

# M1 cleanup audit

Snapshot of the codebase after the M1 "tidy" pass. Tickets CL-01 through
CL-08 from `design_handoff_round3/01-cleanup-pr.md` are addressed in this
PR; what's listed below is the resulting state, not the diff.

## 1. Dead components removed

`HeroSection.tsx` was already gone. The cleanup pass found six more
components on disk with zero importers; all were the legacy
`.card-editorial` primitive's only callers, so deleting them satisfied
CL-03 without a manual migration.

| File                              | Status   | Notes                                                          |
|-----------------------------------|----------|----------------------------------------------------------------|
| `components/HeroSection.tsx`      | gone     | Deleted in Round 2; verified via repo-wide grep.               |
| `components/CalculatorsPreview.tsx` | deleted | No importers.                                                  |
| `components/LearnPreview.tsx`     | deleted  | No importers.                                                  |
| `components/ComparePreview.tsx`   | deleted  | No importers.                                                  |
| `components/InsideVeqtPreview.tsx`| deleted  | No importers.                                                  |
| `components/ChartSidebar.tsx`     | deleted  | No importers.                                                  |
| `components/PriceChart.tsx`       | deleted  | No importers; the home accordion lives in `app/page.tsx`.      |

`components/CommunityWidget.tsx`, `components/layout/Footer.tsx`, and
`components/layout/PageShell.tsx` are also unimported but were left in
place pending an explicit decision — they are coherent components that
may get re-introduced. CL-02's `.section-label` class was the only thing
they shared with the deletion target, and that class has been migrated
to `.bs-stamp` on both files so the CSS could be dropped safely.

## 2. CSS strip (CL-02)

Removed from `app/globals.css`:

- `.card-editorial`, `.card-editorial:hover`, and the
  `[data-theme="dark"] .card-editorial[*]` overrides (≈30 lines around
  the old line 142).
- `.section-label` (≈8 lines around the old line 174).
- `.hero-gradient` and its dark-theme override (≈30 lines around the old
  line 277).

Verification: `grep -n "card-editorial\|hero-gradient\|section-label"
app/globals.css` returns zero matches, and the same grep across
`components/` and `app/` is empty.

## 3. Italics audit (CL-04)

Before: 66 occurrences of `bs-display-italic` across 35 files (the
context doc's "22 / 10" count was a snapshot of `app/`-only files, not
the components tree).

After: 12 occurrences, distributed one-per-file. After `LEARN_ARTICLES`
is fully retired the count drops to 11.

| File                                              | Uses | Role                                       |
|---------------------------------------------------|------|--------------------------------------------|
| `app/page.tsx`                                    | 1    | Lead h2 (data-driven headline).            |
| `app/distributions/page.tsx`                      | 1    | Lead h1.                                   |
| `app/inside-veqt/page.tsx`                        | 1    | Lead h1.                                   |
| `app/invest/page.tsx`                             | 1    | Lead h1 ("slowly").                        |
| `app/methodology/page.tsx`                        | 1    | Lead h1 ("fine print").                    |
| `app/weekly/page.tsx`                             | 1    | Lead h1 ("week by week").                  |
| `app/community/page.tsx`                          | 1    | Lead h3 ("the holders").                   |
| `app/compare/page.tsx`                            | 1    | Lead h2 ("the field").                     |
| `components/learn/ArticleLayout.tsx`              | 1    | Article-page lead h1.                      |
| `components/weekly/WeeklyDispatchLayout.tsx`      | 1    | Dispatch-page lead h1.                     |
| `components/mdx/Pullquote.tsx`                    | 1    | Pullquote display style (deliberate).      |

Section-level italic ems on `BottomLine`, `WhoThisSuits`,
`FAQSection`, `Letters`, `CommunityContent`, `StakeDefault`,
`StandingFeature`, `CalculatorFrame`, `CalculatorTabs`, the various
`learn/` cards, and the in-page `<em>` decorations on the page files
were all stripped. Their `<em>` tags remain so semantic emphasis
survives — only the editorial display class is gone.

## 4. Vermilion discipline (CL-05)

Explicit edits this PR ships:

- `app/globals.css` — `.bs-stamp` color: `var(--stamp)` → `var(--rule)`.
  Section labels now read in tan, not vermilion.
- `app/globals.css` — `.bs-lede::first-letter` color:
  `var(--stamp)` → `var(--ink)`. The duplicate-color declaration was
  also removed.
- `app/globals.css` — `.bs-link:hover` no longer changes color; it
  thickens the underline (`text-decoration-thickness: 2px`).
- `app/page.tsx` — the inception-calculator `$` glyph and its input
  underline switched to `var(--ink)`. Focus state now flips to
  `var(--stamp)` (matches the "today's signal" rule, since active focus
  is a momentary highlight).

Vermilion call sites that remain (intentional):

- The live-wire dot in the masthead (when the market is open).
- `SeverityMeter` marker disc + zone label.
- `VolatilityHeatmap` negative-day cells, the today ring, and the legend
  swatch.
- `TiltBar` US segment (US-tilt is the at-a-glance signal in the home
  compare table).
- `EditionRecommends` zone badge.
- "House Choice" badge on VEQT in the home compare table.

Out-of-scope and flagged for follow-up: 14 files still ship
`hover:text-[var(--stamp)]` / `group-hover:text-[var(--stamp)]` link
hovers (`Letters`, `learn/PathCard`, `learn/RelatedReading`,
`learn/EditorsPicks`, `learn/ArticleRow`, `learn/PathDetail`,
`broadsheet/dispatch/NextDispatch`, `broadsheet/dispatch/DispatchTOC`,
`broadsheet/EngravingChart`, `broadsheet/Masthead`,
`weekly/WeeklyDispatchLayout`, `community/CommunityContent`,
`app/page.tsx`, `app/weekly/page.tsx`). These violate the
"link hovers don't recolor" rule but were not part of CL-05's listed
edits — the home page screenshots still meet the static-state
acceptance ("vermilion appears only on…").

## 5. SeverityMeter compact (CL-06)

`SeverityMeter` accepts an optional `compact` prop. When set:
- inline legend hidden,
- editorial sentence hidden,
- gauge halves to ~10px tall,
- the zone label moves into the header row.

`SeverityMeterAuto` (`components/broadsheet/SeverityMeterAuto.tsx`) is
a new client wrapper that fetches the data the home page wires by hand,
so interior pages can mount `<SeverityMeterAuto compact />` without
duplicating the `useVeqtData` + full-history fetch logic.

Mounted at:

- `app/invest/page.tsx`, between the "Pick the question" header and the
  CalculatorTabs strip.
- `components/learn/ArticleLayout.tsx`, conditional on
  `frontmatter.slug === "veqt-is-down"`, rendered above the body
  prose. There is no dedicated `app/learn/veqt-is-down/page.tsx`; the
  article is MDX served by `app/learn/[slug]/page.tsx`, so the meter is
  injected at the layout level.

Home-page `<SeverityMeter />` (no props) is unchanged.

## 6. Home `/learn` triplet (CL-07)

The home `LEARN_ARTICLES.map(...)` block is replaced by a hardcoded
`COURSE_1` constant in `app/page.tsx`. Three steps, three slugs:

1. `what-is-veqt` — "What VEQT actually is"
2. `veqt-vs-diy-portfolio` — "Why one fund and hold forever"
3. `veqt-is-down` — "What to do when it's down"

The handoff prompt suggested a slug `one-fund-portfolio` for step 2;
no such article exists in `content/learn/`. The closest semantic match
is `veqt-vs-diy-portfolio` (the canonical "why one fund vs five" piece),
which is what step 2 now points at.

Headline: `"From the archive · Three to start with"` → `"A reading
order, in three parts."` Stamp: `"From the archive"` → `"Course One"`.

`LEARN_ARTICLES` is no longer imported on the home page. It still lives
in `lib/constants.ts` and may have other consumers; not removed in this
PR.

## 7. Home Tilt column (CL-08)

New tiny component: `components/broadsheet/TiltBar.tsx`.
- `weights: { us, ca, dev, em }` (sum ≈ 1).
- Optional `label` for the `aria-label`.
- Renders four `<span>`s under `.bs-tilt-bar` (CSS already in
  `globals.css:1304`).

Q1 2026 weights for VEQT/XEQT/ZEQT are hardcoded in `app/page.tsx`
as `TILTS`. Update when fresh factsheets file.

The home compare table now has six columns. A small-caps inline legend
sits below the table on `sm+` viewports; the Tilt column collapses on
mobile (the `<th>` is `hidden sm:table-cell`).

## 8. Routes — masthead variants (unchanged)

Same as Round 2 audit. Every interior page renders `<Masthead
variant="interior" />` via `InteriorShell`; only `app/page.tsx` renders
`variant="home"` directly. No routes added in this PR.

## 9. Build & lint

- `npm run build` passes (verified at start, after each ticket, and at
  the end). Output unchanged in route count.
- `npm run lint` errors with `TypeError: Converting circular structure
  to JSON` from `@eslint/eslintrc`. **This error reproduces on
  `origin/main` before any of these changes** — it is a pre-existing
  problem with the ESLint config, not something this PR introduced.
  Flagged for separate investigation.
