# 22 — Teardown: `/learn`

**Milestone:** M2
**Effort:** Low (~4 hours)
**Goal:** Refocus `/learn` from a CMS-shaped page with seven affordances into **three named courses** plus an archive below.

---

## What's wrong

Round 2 overshot the brief. The plan asked for "a reading order in three parts." What shipped is the opposite: filter rail, Editor's Picks, Paths grid, grouped categories — **every order, all at once**.

Result: no path, no recommended starting point, no "if you only read three things, read these."

---

## What replaces it

Two-block page: **three named courses** above, **everything else** below.

```
┌────────────────────────────────────────────────────────────────┐
│  LEAD                                                          │
│  Three courses. Three articles each. In order.                 │
│  (italic on "in order"; serif lead)                           │
│                                                                │
│  Deck: 1-2 sentences explaining the structure.                 │
├────────────────────────────────────────────────────────────────┤
│  COURSE GRID (3 columns, 1 row on desktop; stacked on mobile)  │
│                                                                │
│  COURSE 1                COURSE 2                COURSE 3      │
│  What VEQT actually is   Why one fund and        What to do    │
│                          hold forever            when it's     │
│                                                  down          │
│                                                                │
│  • Step 1 → article      • Step 1 → article      • Step 1 →    │
│  • Step 2 → article      • Step 2 → article      • Step 2 →    │
│  • Step 3 → article      • Step 3 → article      • Step 3 →    │
├────────────────────────────────────────────────────────────────┤
│  RULE (2px ink)                                                │
│                                                                │
│  EVERYTHING ELSE, BY TOPIC (eyebrow, sans, mute)              │
│                                                                │
│  [The current grouped-by-category archive, intact, slightly    │
│   smaller type]                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Course definitions

```ts
// lib/learn.ts
export const COURSES = [
  {
    number: 1,
    title: "What VEQT actually is",
    blurb: "The one-paragraph version, the ten-paragraph version, and what's inside.",
    articles: [
      { step: 1, slug: "what-is-veqt",      title: "What VEQT is, in one paragraph" },
      { step: 2, slug: "anatomy-of-veqt",   title: "The four ETFs inside the ticker" },
      { step: 3, slug: "13000-companies",   title: "What 13,000 holdings actually means" },
    ],
  },
  {
    number: 2,
    title: "Why one fund and hold forever",
    blurb: "The argument for radical simplicity, in three reads.",
    articles: [
      { step: 1, slug: "why-not-stockpicking",  title: "Why not just pick stocks" },
      { step: 2, slug: "the-couch-potato",      title: "The couch-potato portfolio, finished" },
      { step: 3, slug: "rebalance-or-not",      title: "What VEQT does that you'd otherwise have to do yourself" },
    ],
  },
  {
    number: 3,
    title: "What to do when it's down",
    blurb: "The hardest part, broken into three steps.",
    articles: [
      { step: 1, slug: "veqt-is-down",          title: "When the market is in red — read first" },
      { step: 2, slug: "history-of-drawdowns",  title: "Every drawdown VEQT has seen" },
      { step: 3, slug: "the-discipline",        title: "The thing that makes hold-forever work" },
    ],
  },
];
```

**Slug verification:** Some of these articles may not exist yet. Audit `app/learn/[slug]/` — for any missing slug, either:
1. Stub a placeholder MDX/article so the link doesn't 404, OR
2. Substitute an existing slug from the current archive that fits the same role

Do **not** ship dead links.

---

## Course card visual

```
┌─────────────────────────────────────┐
│ COURSE 1                            │   ← eyebrow, sans, vermilion, 10px
│                                     │
│ What VEQT actually is               │   ← serif, 22px, weight 600, ink
│                                     │
│ The one-paragraph version, the      │   ← serif, 14px, ink-soft, italic
│ ten-paragraph version, and what's   │
│ inside.                             │
│                                     │
│ ───────────────────────────────     │   ← rule, 1px, ink (full)
│                                     │
│ Step 1                              │   ← sans, 9px, mute, upper
│ What VEQT is, in one paragraph →    │   ← serif, 14px, ink, underline-on-hover
│                                     │
│ Step 2                              │
│ The four ETFs inside the ticker →   │
│                                     │
│ Step 3                              │
│ What 13,000 holdings means →        │
└─────────────────────────────────────┘
```

Three of these in a row on desktop (~360px each, gap-8). Stack on mobile.

No box, no shadow. Vertical hairlines (`border-l var(--rule)`) between columns on desktop only.

---

## "Everything else, by topic"

The current grouped categories block stays, **intact**, but:
- Eyebrow becomes "EVERYTHING ELSE, BY TOPIC" (uppercase, sans, mute) instead of being the page's main mode
- Visual weight reduced: smaller h3s for category headers, tighter row heights, `var(--ink-soft)` instead of `var(--ink)`
- Filter rail: keep if it's there, but it's a secondary affordance now

The point is: a confused first-timer sees three courses and starts. A returning reader scrolls past the courses to the archive.

---

## Home page connection

Per CL-07, the home page's `/learn` block becomes Step 1 / Step 2 / Step 3 from **Course 1** ("What VEQT actually is"). This makes the home page the doorway into the syllabus, and `/learn` the syllabus itself.

Do not duplicate the data — `lib/learn.ts` exports `COURSES`, both the home page and `/learn` import from it.

---

## Acceptance criteria

- [ ] `/learn` lead block renders the new headline "Three courses. Three articles each. In order."
- [ ] Three course cards render side by side (stack on mobile)
- [ ] Each card has eyebrow, title, blurb, and three numbered article links
- [ ] All linked slugs resolve to real articles (no 404s)
- [ ] The "Everything else, by topic" archive renders below, visually demoted
- [ ] Home page `/learn` block (CL-07) imports from the same `COURSES` data
- [ ] No new design tokens
- [ ] Builds, lints clean

---

## Out of scope

- No new article content. If a slug is missing, stub it; don't write the article in this round.
- No "track your progress through the course" UX. Future work.
- No tagging system overhaul. The existing categories stay as-is, just visually demoted.
