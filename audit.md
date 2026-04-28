# Round 3 — M1 cleanup audit

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
