# Handoff — Buy VEQT, Round 3

This bundle is the executable plan for the next round of work on **buyveqt-main** (Next.js / React / Tailwind / TypeScript). It is intended to be handed to **Claude Code** in the repo and worked through in order.

---

## About the design files

The HTML files in `design-refs/` are **design references**, not production code to copy. They are prototypes showing intended look, content, and behavior. The task is to **recreate these designs inside the existing `buyveqt-main` codebase**, reusing its established patterns:

- Next.js app router (`app/`)
- Tailwind v4 with the editorial design system in `app/globals.css` (broadsheet primitives — `.bs-*`, `.bs-display-italic`, etc.)
- Components in `components/broadsheet/*` and `components/learn/*`
- Data in `lib/` and the `useVeqtData` hook
- Existing components (`Masthead`, `EditionRecommends`, `VolatilityHeatmap`, `SeverityMeter`, `InteriorShell`) are the design vocabulary — extend, don't replace

**Do not import the design HTML directly.** Treat each HTML file as a spec to translate into TSX components against the existing system.

## Fidelity

**High-fidelity for visual treatment** (typography, color, spacing, layout density) — the strategic memo (`design-refs/Round2-Review-v2.html`) and the inline SVG mocks within it show final-look intent.

**Mid-fidelity for the new components** — the SVG mocks describe shape, hierarchy, and copy, but exact pixel values come from the existing `globals.css` token set (`--ink`, `--paper`, `--rule`, `--stamp`, `--bs-*` classes). Match the existing system; do not invent new design tokens.

---

## How to read this bundle

Read the docs in this order:

1. `00-context.md` — current state of the repo, what shipped in Round 2, what slipped, what to leave alone
2. `01-cleanup-pr.md` — the small loose threads from Round 2 (do this first, single PR, ~half day)
3. `10-bet-what-you-own.md` — first big swing, medium effort, high impact
4. `11-bet-compare-rebuild.md` — second big swing, medium-high effort, high impact
5. `12-bet-veqt-history.md` — third big swing, high effort, defining
6. `20-teardown-compare.md`, `21-teardown-invest.md`, `22-teardown-learn.md` — page-level rethinks; each pulls from one or more bets above

Each doc has a **Goal**, **Where it goes** (file paths), **What to build** (component shapes, props, data), **Acceptance criteria**, and **Out of scope**.

The `prompts/` folder has ready-to-paste prompts for Claude Code — one per ticket. Each prompt references the relevant doc(s) and tells Claude Code which files to read first.

---

## Recommended sequencing

Three milestones, each independently shippable:

| Milestone | Tickets | Goal |
|---|---|---|
| **M1 — Tidy** | `01-cleanup-pr.md` | Pay down Round 2 debt. Single PR. Half a day. |
| **M2 — One ambitious component** | `10-bet-what-you-own.md` + `22-teardown-learn.md` | Add `HoldingsPanel` to home; refocus `/learn`. ~1 week. |
| **M3 — Structural rethink** | `11-bet-compare-rebuild.md` + `20-teardown-compare.md` + `21-teardown-invest.md` | Rebuild `/compare` as behavioural; reframe `/invest` calculators as cohort fans. ~2 weeks. |
| **M4 — New section** | `12-bet-veqt-history.md` | New `/history` route, scroll-locked timeline. ~3 days focused. |

M1 must land before M2. M2/M3/M4 can move in parallel if multiple agents are working.

---

## Codebase conventions to preserve

These are the implicit rules already established in the repo. Claude Code should keep them.

- **Editorial CSS lives in `app/globals.css`.** New utility classes follow the `.bs-*` prefix (`bs-display-italic`, `bs-stamp`, `bs-label`, `bs-rule`).
- **No new design tokens.** Use the existing CSS variables: `--ink`, `--ink-soft`, `--ink-mute`, `--paper`, `--paper-deep`, `--rule`, `--stamp`, `--green`, `--amber`. If a value is missing, raise it before adding.
- **Server components by default.** `"use client"` only for components with state, effects, or browser APIs (calculators, the heatmap tooltip, the chart accordion).
- **Data files in `lib/`.** Static JSON snapshots (holdings, daily closes) go in `lib/data/` with a quarter or date suffix in the filename: `lib/data/holdings-2026-q1.json`.
- **Vermilion (`var(--stamp)`) is a discipline color.** It marks today's notable signal — the live-wire dot, drop-caps, severity color, the lead h2 italic accent. It is **not** a hover color, **not** a generic accent, **not** a chart fill on every chart. The cleanup PR is enforcing this rule; new work must respect it.
- **Italics (`.bs-display-italic`) are once-per-page.** On the lead headline. Not on every section h3.
- **Tabular numerals.** Anything numeric in a table or stat strip uses `font-variant-numeric: tabular-nums`. There's a utility class for this; check `globals.css`.

---

## Design tokens (reference)

Already defined in `app/globals.css`. Do not duplicate.

```
--ink:        #0f0d0a   /* primary text */
--ink-soft:   #2a2520   /* secondary text */
--ink-mute:   #5b5147   /* tertiary, captions */
--paper:      #f6efdc   /* page background */
--paper-deep: #ede3ca   /* card / strip background */
--rule:       #b8a66e   /* hairlines, dividers */
--stamp:      #8a1c1c   /* Vanguard red — discipline color */
--green:      #1d5431   /* positive day */
--red:        #8a1c1c   /* negative day (== --stamp) */
--amber:      #8a6c1c   /* neutral / partial */
```

**Type stack:**
- Display & body serif: `Source Serif 4` (or whatever the project currently uses; check `app/layout.tsx` `<head>`)
- UI sans: `Inter`
- Mono: `JetBrains Mono`

If `app/globals.css` differs from the above, **the codebase wins** — the memo's font stack (`Fraunces`, `Newsreader`) was the memo's, not the production site's.

---

## Files

```
design_handoff_round3/
├── README.md                           ← this file
├── 00-context.md
├── 01-cleanup-pr.md
├── 10-bet-what-you-own.md
├── 11-bet-compare-rebuild.md
├── 12-bet-veqt-history.md
├── 20-teardown-compare.md
├── 21-teardown-invest.md
├── 22-teardown-learn.md
├── prompts/
│   ├── prompt-cleanup.md
│   ├── prompt-bet-01.md
│   ├── prompt-bet-02.md
│   ├── prompt-bet-03.md
│   ├── prompt-teardown-compare.md
│   ├── prompt-teardown-invest.md
│   └── prompt-teardown-learn.md
└── design-refs/
    ├── Round2-Review-v2.html           ← strategic memo, START HERE
    ├── Round2-Plan.html                ← the Round 2 plan it audits
    ├── Critique.html                   ← the Round 1 critique that started this thread
    └── Inside-VEQT.html                ← detail-page reference
```
