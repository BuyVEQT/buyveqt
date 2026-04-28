# Prompt — Bet 01: HoldingsPanel

Copy this verbatim into Claude Code at the **root of the buyveqt-main repo**. **M1 must be merged first.**

---

You are working on the `buyveqt-main` repo. Read these files in order:

1. `design_handoff_round3/README.md`
2. `design_handoff_round3/00-context.md`
3. `design_handoff_round3/10-bet-what-you-own.md`
4. The file `design_handoff_round3/design-refs/Round2-Review-v2.html`, specifically the "Bet 01" section — open it in a browser to see the SVG mock with treemap, top-names list, and long-tail sentence.

Also read these existing components for vocabulary (do **not** modify them):
- `components/broadsheet/VolatilityHeatmap.tsx` — for SVG composition style
- `components/broadsheet/EditionRecommends.tsx` — for sentence-as-component pattern
- `app/page.tsx` — for the home-page section ordering

Then implement everything in `10-bet-what-you-own.md`:

1. Create `lib/data/holdings-2026-q1.json` with placeholder data using the schema in the doc. **Verify all numbers against Vanguard's most recent VEQT factsheet** before considering the ticket done — if you cannot access the factsheet, leave a TODO comment with the file URL and proceed with placeholders.
2. Create `lib/holdings.ts` with the `computeLongTail` helper (or whatever shape the existing `lib/` patterns suggest — match the codebase).
3. Create `components/broadsheet/HoldingsPanel.tsx` per the layout spec.
4. Mount it in `app/page.tsx` between region cards and the compare table.

Constraints:

- No new design tokens. Use `--ink`, `--paper`, `--paper-deep`, `--rule`, `--stamp`, `--ink-soft`, `--ink-mute` only.
- The treemap is a **single hand-built SVG**. Four `<rect>`s, four `<text>` blocks per cell. No treemap library.
- The closing long-tail sentence is **computed**, not hardcoded. It must update if the data file is replaced.
- Server component if possible; `"use client"` only if you add hover/tooltip interactivity.
- Mobile: columns stack. Treemap retains aspect ratio.
- Add `<title>` elements inside each treemap rect for screenreader access.

Workflow:
1. Branch: `feature/holdings-panel`.
2. Build the data file and helper first, with a quick `console.log` test of `computeLongTail`.
3. Build the component in isolation — render it on a temporary page or use the existing component playground if there is one.
4. Mount on home, take screenshots at 1366×768, 1024×768, 390×844.
5. Verify the long-tail sentence reads naturally: "The bottom 13,468 holdings together weigh less than Apple, Microsoft and Nvidia combined." If your computed numbers don't make that sentence true, either fix the data or rewrite the sentence to match.
6. PR description: include the three screenshots, the computed long-tail values, and the source factsheet URL.

If the holdings factsheet shows numbers that contradict the placeholder claim ("bottom holdings weigh less than top 3"), **change the sentence template** to match reality. Do not ship a misleading number to make the design work.

If anything is ambiguous, ask before guessing. Specifically: if the codebase already has a region/holding visualization (treemap, donut, anything), ask whether to extend or replace it.
