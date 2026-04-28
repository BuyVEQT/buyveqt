# Prompt — Bet 03: /history (new section)

Copy verbatim into Claude Code at the **root of the buyveqt-main repo**. **M1 must be merged first. M2 ideally merged.**

---

You are working on the `buyveqt-main` repo. Read these files in order:

1. `design_handoff_round3/README.md`
2. `design_handoff_round3/00-context.md`
3. `design_handoff_round3/12-bet-veqt-history.md`
4. `design_handoff_round3/design-refs/Round2-Review-v2.html` — "Bet 03" section, open in browser

Also read:
- `components/broadsheet/Masthead.tsx` — to understand the nav rail (you'll add `/history` to it)
- `components/broadsheet/VolatilityHeatmap.tsx` — for the SVG approach
- Any existing scroll-driven component in the codebase (search for `scroll`, `IntersectionObserver`, `getBoundingClientRect`) — extend the project's pattern; do not introduce a new one

Then implement `12-bet-veqt-history.md`:

1. **Data first.** Create `lib/data/veqt-history.json`. Daily closes from 2019-01-29 to today. Roughly 1750 rows. Source: same pipeline as `/compare`. If file size is a concern (>50kb gzipped), step down to weekly closes — at the chart's zoom level, no one will notice.

2. **The anchors.** Five hand-curated anchor objects in the JSON: launch, covid, rate-hikes, yen, today. Each with `date`, `price`, `label`, `drawdown`, and a short prose note.

3. **Components:**
   - `components/history/HistoryHero.tsx` — sticky scroll-locked horizontal timeline
   - `components/history/HistoryAnchor.tsx` — one anchor's annotation block (faded by scroll progress)
   - `components/history/HistoryAxis.tsx` — bottom year axis
   - `components/history/InvestmentJourney.tsx` — the `$10K → $X` strip with anchor-keyed caption
   - `components/history/HistoryAnchorCard.tsx` — vertical card used both on mobile and below the sticky section on desktop

4. **The route:** `app/history/page.tsx`.

5. **Nav update:** Add `/history` to the `Masthead.tsx` nav rail between `/inside-veqt` and `/community`. Plain noun: "History."

6. **Mobile fallback** — non-negotiable. On screens <1024px, render the full price chart as a single static SVG plus the five anchor cards stacked vertically. **No sticky scroll on mobile.**

Constraints:

- **No new dependencies.** Implement the scroll-locked behavior with a vanilla scroll listener and `getBoundingClientRect`. If `framer-motion` is already in the repo, you may use it; if not, do not add it.
- The price line is a **static SVG path**. The illusion of horizontal scroll is achieved by translating a `<g>` based on scroll progress, not by re-computing the path.
- Anchor annotations fade in/out with scroll progress, but their **DOM position is static** — they're absolutely positioned over the SVG.
- No new design tokens.
- The investment-journey strip must compute its current `$X` value from interpolation between the two surrounding anchors based on scroll progress.

Workflow:

1. Branch: `feature/history-section`.
2. Data + anchor JSON first. Sanity-check the anchor prices against a public chart of VEQT.
3. Static rendering first: get the SVG path, year axis, and five anchor annotations rendering correctly **without** the scroll-lock. Take a screenshot.
4. Add the scroll-lock. Test on Chrome desktop, Firefox, Safari.
5. Add the investment-journey strip with interpolation.
6. Build the mobile fallback. Test in iOS Safari simulator and at 390px viewport.
7. Add `/history` to the masthead nav.
8. Below-the-sticky longform: five HistoryAnchorCard components, ~2 paragraphs each. Use the prose notes from the JSON anchors as the source.
9. Closing reflection block + CTA link to `/inside-veqt#heatmap`.
10. Screenshots: 1920×1080, 1366×768, 390×844 (mobile sticky-disabled), and a short screen-capture of the scroll behavior on desktop.

Stop and ask if:
- The desktop scroll-lock interaction feels wrong after a first attempt — show me a screen recording before iterating, so we can decide together whether to tune duration, easing, or fall back to a non-locked horizontal scroll.
- The data file would exceed 100kb — propose weekly vs. daily resolution.
- The page would benefit from a date scrubber (it shouldn't, per the doc — but if you find a strong reason, raise it before building).
