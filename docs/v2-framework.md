# V2 Framework — post-audit baseline and roadmap

_Compiled 2026-07-31, from the full-site audit (dead code + wiring + performance,
three static sweeps plus a runtime walk of every route). The audit's fix pass
(PR #287) is the baseline this document assumes._

## Where the site stands after the audit pass

- **Navigation:** zero broken internal links across all routes, MDX content,
  and dynamic params. All anchors and query params round-trip.
- **Speed:** font critical path is 34 KB (Archivo only — was 281 KB); no
  duplicate API fetches anywhere (shared module stores with dedupe +
  freshness + visibility awareness); `/community` and all OG images are
  static; the only dynamic page routes are `/calculators` (share-card
  metadata, intentional) and the API layer.
- **Weight:** 375 KB of dead source and two-thirds of globals.css removed;
  the deploy no longer carries a dead recharts chunk or diagnostic API
  routes.
- **JS:** framework floor is ~166 KB gz; the heaviest route delta is
  `/learn/[slug]` at +32 KB gz (the exhibit registry — see below).

## Structural v2 items (ranked)

1. **Split the article exhibit registry.** `ArticleBody.tsx` statically
   imports 27 client components into one 32 KB gz chunk shipped to all 26
   articles; the median article uses 2, three use none. Wrap registry
   entries in `next/dynamic` (LazyChartWidgets already proves the pattern)
   or derive a per-article registry from frontmatter. ~25–30 KB gz off 23
   articles.
2. **Finish the Instrument migration — the last broadsheet surfaces.**
   `/learn/path`, `/learn/path/[id]` (6 pages), `/weekly/[slug]`,
   `/not-found`, and `app/error.tsx` (never styled at all) still wear the
   old system via `InteriorShell`. Finishing lets us delete the Newsreader
   + Fraunces families outright (10 of 22 font files), the
   `[data-broadsheet]` CSS family, and InteriorShell itself. Also
   `/compare/[slug]`'s lower half (`BottomLine`) still mixes systems.
3. **Retire recharts.** Three articles use it (fee calculator, withdrawal
   simulator, covered-call chart), each paying a 108 KB gz on-demand chunk.
   The redesign proved hand-rolled SVG covers the house chart grammar.
   Removing it also retires the `optimizePackageImports` workaround.
4. **Split globals.css by system.** One 19.7 KB gz blob ships to every
   route, mixing Tailwind, the Instrument, and the remaining broadsheet
   family. After item 2, co-locate what's left per route so dead CSS can't
   silently re-accumulate.
5. **Animation hygiene at rest.** The home page runs 4–7 infinite
   animations permanently (state-dependent), all on SVG children that
   repaint on the main thread. Add off-screen pausing (the article
   exhibits' `useExhibit` IntersectionObserver pattern) to the glyph,
   chart-hint, and end-dot loops; consider `content-visibility` for
   below-fold modules.

## Content and product decisions (not engineering)

- **Weekly has zero issues.** The whole pipeline renders an (intentional,
  honest) empty state. Ship the first dispatch or cut the section; if cut,
  ~3 more files + the `.prose-custom` block go with it.
- **`/compare/veqt-vs-vun` is promised but unbuilt** — the bout, verdict
  copy, and meta description all exist; only the `data/comparisons.ts`
  entry is missing. Add it or trim the meta copy.
- **`/compare/[slug]` pages have no navigational inbound** (only MDX body
  links) — decide whether the in-place bout switcher should deep-link to
  them (SEO value) or whether they fold into the index permanently.
- **`/almanac/[date]` permalinks** — ledger rows already carry date ids;
  a thin dynamic route redirecting to `/almanac#{date}` completes the
  handoff's archive story.
- **Editions still trigger intraday** — the handoff wants Red/Ink editions
  to print at the close only (needs a market clock), plus a
  "MARKETS CLOSED · REOPENS 9:30 ET" rail state and a stale-quote badge.
- **Dark mode is gone by design** (round-5 handoff dropped the toggle; the
  audit deleted the inert CSS). A future dark treatment would be a new
  design decision, not a revert.

## Known accepted quirks (documented, not bugs)

- `/calculators` renders dynamically — the cost of parameterized share
  metadata.
- Compare fires 7 chart fetches on load — the per-bout spread row needs
  them; could defer below-fold in v2 item 1's spirit.
- The Vanguard factsheet PDF host 403s — the sleeve pipeline that used it
  was deleted; holdings now come from the registry snapshot.
- Session-board heat cells are mouse-only by design; keyboard users get
  "OPEN THE FULL BOARD →".

## Verification norms going forward (what this audit institutionalized)

- Static sweeps lie in both directions: pair every audit with a runtime
  walk (the fetch-storm regression was invisible to static analysis; the
  "public design ref exposed" scare was a local-only artifact).
- Scroll-driven behavior (rAF, IntersectionObserver, scroll events) cannot
  be verified in a hidden automation pane — needs a human scroll or a
  visible pane.
- Numbers shown to readers must trace to the registry/live data — the
  audit removed the last fabricated figures ("4,238 readers",
  "Edition 47").
