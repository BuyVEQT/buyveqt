# Prompt — Bet 02: /compare rebuild

Copy verbatim into Claude Code at the **root of the buyveqt-main repo**. **M1 must be merged first.**

---

You are working on the `buyveqt-main` repo. Read these files in order:

1. `design_handoff_round3/README.md`
2. `design_handoff_round3/00-context.md`
3. `design_handoff_round3/11-bet-compare-rebuild.md`
4. `design_handoff_round3/20-teardown-compare.md` (subsumed; for context only)
5. `design_handoff_round3/design-refs/Round2-Review-v2.html` — "Bet 02" section, open in browser to see the three event-column mock

Also read:
- `app/compare/page.tsx` — the current page (will be largely replaced)
- `components/broadsheet/VolatilityHeatmap.tsx` — for SVG patterns
- `lib/veqt-data.ts` (or wherever current price data lives) — extend, do not duplicate

Then implement `11-bet-compare-rebuild.md` end-to-end:

1. **Data first.** Create `lib/data/compare-events-2026.json` with three events × three funds × ~90 trading days each. Source: pick whatever the project's existing data layer supports (Yahoo, Stooq, hand-tabulated CSV — match what's there). Normalize each fund's price to 1.000 at the start of each window.

2. **Verify the anecdotes against the data.** The doc's draft anecdotes ("VEQT fell 34%, recovered in 142 days") are starting points. Compute the actual values from your data. If they differ, **update the anecdote text**, not the data.

3. **Components, in this order:**
   - `components/compare/EventColumn.tsx` — single event, three normalized lines, drawdown reference line, anecdote
   - `components/compare/EventHero.tsx` — wraps three EventColumns
   - `components/compare/TiltComparison.tsx` — three stacked-bar rows for VEQT/XEQT/ZEQT regional weights

4. **Restructure `app/compare/page.tsx`:**
   - Lead block ("Three funds. Three moments.")
   - EventHero
   - TiltComparison
   - Closing line ("They hold the same world, weighted differently.")
   - Demoted spec table (existing 5-col table, smaller type, "If you came for the spec sheet…" eyebrow)

Constraints:

- No new design tokens.
- All charts are hand-built SVG. No charting library. (If `recharts` or similar is already in `package.json`, ask before introducing it here.)
- The TiltBar color legend must be **identical** to the home-page TiltBar from CL-08. Both should ideally import from a shared `<TiltBar>` component — refactor if needed.
- The page is **mostly server-rendered**. `"use client"` only if you add hover tooltips or interactive scrubbing.
- Mobile: EventColumns stack vertically. Spec table goes scroll-x.

Workflow:

1. Branch: `feature/compare-behavioural`.
2. Data + anecdote verification first. Show me your computed drawdowns and recovery days before writing component code — paste them into the PR description as a small table.
3. Build EventColumn in isolation; verify against the SVG mock (Round2-Review-v2.html, Bet 02).
4. Build EventHero, then TiltComparison.
5. Restructure the page.
6. Screenshots at 1366×768, 1024, and 390 mobile.
7. Read the page out loud start to finish — does the lead → hero → tilt → closing → spec sequence read like a piece of writing? If not, fix the headline/closing copy before merging.

Stop and ask if:
- The current `/compare` page has features the rebuild would lose (e.g., a fund-picker dropdown, a third comparison fund beyond ZEQT) — confirm whether to preserve.
- Your computed drawdown for any fund is so different from the draft anecdote that the whole anecdote needs rewriting — show me the data first.
