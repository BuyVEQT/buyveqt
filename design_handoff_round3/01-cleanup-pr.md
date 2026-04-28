# 01 — Cleanup PR

**Milestone:** M1 — Tidy
**Effort:** ~half a day, single PR
**Goal:** Resolve every loose thread from Round 2 in one focused pass. No new features. Visual diff should be subtle but pervasive.

---

## Tickets in this PR

### CL-01 · Delete dead `HeroSection`

**Where:** `components/HeroSection.tsx`

**Action:** Verify zero imports (`grep -r "HeroSection" --include='*.tsx' --include='*.ts'`), then delete the file.

**Acceptance:** File is gone; `pnpm build` passes; no missing-import errors.

---

### CL-02 · Strip dead CSS

**Where:** `app/globals.css`

**Action:** Delete these blocks (verify each is unused first):
- `.card-editorial` block (~line 138)
- `.hero-gradient` block (~line 200)
- `.section-label` block (~line 271)
- The `[data-theme="dark"] .card-editorial` overrides (search for the selector)

**Before deleting `.card-editorial`:** see CL-03 — components must be migrated first.

**Acceptance:** `grep -n "card-editorial\|hero-gradient\|section-label" app/globals.css` returns nothing.

---

### CL-03 · Migrate `card-editorial` consumers

**Where:** Components currently using the legacy class.

**Action:** Run:

```bash
grep -rl "card-editorial" components/
```

Expected hits (≈9 files): `InvestCalculator`, `ChartSidebar`, `InsideVeqtPreview`, `ComparePreview`, `LearnPreview`, `PriceChart`, `CalculatorsPreview`, plus two others.

For each file, replace `card-editorial` with the broadsheet equivalent. The right replacement depends on context:

- A boxed metric card → use `bs-card` (or whatever the current primitive is in `globals.css` — search for `bs-card`, `bs-panel`)
- A bordered list block → use `bs-rule` borders directly: `border-t border-b border-[color:var(--ink)]`
- A "callout" with a tinted background → `bg-[color:var(--paper-deep)] p-6`

**Rule:** No `card-editorial` should remain in `components/` or `app/`. No new tokens added; only existing `.bs-*` primitives or inline Tailwind referencing existing CSS variables.

**Acceptance:** `grep -r "card-editorial" --include='*.tsx' --include='*.ts'` returns zero matches across the entire repo.

---

### CL-04 · Italics audit — target ≤2 per page file

**Where:** Every file under `app/` and `components/` using `bs-display-italic`.

**Action:** Run:

```bash
grep -rln "bs-display-italic" app/ components/
```

For each file, **keep at most one** `bs-display-italic` — on the **lead headline of that page** (typically the h2 inside the lead section or hero). Remove the class from every other occurrence — section h3s, eyebrow text, recurring decoration. The text remains; only the italic styling is dropped.

**Specific known offenders:**
- `app/page.tsx` — currently 4 uses, target 1–2
- `app/distributions/page.tsx` — currently 6 uses, target 1
- `app/community/page.tsx`, `app/compare/page.tsx`, `app/learn/page.tsx` — audit each

**Acceptance:** `grep -c "bs-display-italic"` per file ≤ 2; total across repo ≤ 12 (down from 22).

---

### CL-05 · Vermilion (`var(--stamp)`) discipline

**Where:** `app/globals.css` and any component using `text-[color:var(--stamp)]` or `color: var(--stamp)`.

**Rule going forward:** `var(--stamp)` marks **today's notable signal only**.
- ✅ The live-wire dot in the masthead (when market is open)
- ✅ The Severity Meter color when severity is high
- ✅ The vermilion swatch in the heatmap legend (negative-day color)
- ✅ The "today" ring on the heatmap
- ❌ Section labels (`.bs-stamp` class — change to `var(--rule)` or `var(--ink-mute)`)
- ❌ Drop-caps (`bs-lede::first-letter` — change to `var(--ink)`)
- ❌ Link hover states (`a:hover` should shift weight or underline, not color)
- ❌ The `$` in the inception calculator (change to `var(--ink)`)

**Action:** Three CSS edits in `app/globals.css`:

```css
/* before */
.bs-stamp { color: var(--stamp); ... }
.bs-lede::first-letter { color: var(--stamp); ... }
a:hover { color: var(--stamp); ... }   /* if present */

/* after */
.bs-stamp { color: var(--rule); ... }
.bs-lede::first-letter { color: var(--ink); ... }
a:hover { text-decoration-thickness: 2px; }   /* or similar non-color affordance */
```

Plus one component edit: `InvestCalculator` — change the `$` glyph color from `var(--stamp)` to `var(--ink)`.

**Acceptance:** Manual visual scan — vermilion appears only on the live-wire dot, severity meter (when severe), and heatmap negative cells / today-ring.

---

### CL-06 · Add `compact` prop to `SeverityMeter` and reuse it

**Where:**
- `components/broadsheet/SeverityMeter.tsx` — add the prop
- `app/learn/veqt-is-down/page.tsx` — mount it as the article opener
- `app/invest/page.tsx` — mount it next to the calculator

**Spec:**

```ts
interface SeverityMeterProps {
  // existing props...
  compact?: boolean;   // when true: hide inline legend, hide prose sentence,
                       // halve gauge height, no description column
}
```

When `compact={true}`, the meter renders in a horizontal strip ~80px tall: gauge on the left, current severity word + percentile on the right. No legend, no prose.

**Acceptance:**
- `<SeverityMeter />` (no prop) renders unchanged on the home page
- `<SeverityMeter compact />` renders on `/learn/veqt-is-down` (top of article) and `/invest` (above calculators)
- `pnpm build` passes; no TypeScript errors

---

### CL-07 · Home `/learn` block — Step 1 / Step 2 / Step 3

**Where:** `app/page.tsx`, around line 381 (the block currently titled "From the archive · Three to start with" using `LEARN_ARTICLES.map(...)`).

**Action:** Replace the dynamic map with a hardcoded triplet:

```tsx
const COURSE_1 = [
  { step: 1, slug: "what-is-veqt", title: "What VEQT actually is" },
  { step: 2, slug: "one-fund-portfolio", title: "Why one fund and hold forever" },
  { step: 3, slug: "veqt-is-down", title: "What to do when it's down" },
];
```

Headline change: `"From the archive · Three to start with"` → `"A reading order, in three parts"`.

Each card shows: `Step 1` (eyebrow, ink color, sans), title (serif), 1-line excerpt.

**Acceptance:** Three cards, hardcoded, in order. Footer "Twenty more articles in the archive →" remains, linking to `/learn`. The full archive lives on `/learn` (see `22-teardown-learn.md`).

---

### CL-08 · Home compare table — add the Tilt column

**Where:** `app/page.tsx` around line 307.

**Action:** Add a `<th>Tilt</th>` between Holdings and Inception. Render a small horizontal `<TiltBar>` component per row showing US/Canada/Intl-Dev/EM weights as a stacked 100% bar.

`<TiltBar>` is a new tiny component:

```tsx
// components/broadsheet/TiltBar.tsx
interface TiltBarProps {
  weights: { us: number; ca: number; dev: number; em: number };  // sums to 1
  width?: number;  // default 96
}
```

Colors: US `var(--stamp)`, CA `var(--ink)`, Dev-ex-US `var(--ink-mute)`, EM `var(--rule)`. Inline legend below the table (small caps, sans, ink-mute).

Data for VEQT/XEQT/ZEQT weights: hardcode in the page file from public Vanguard/iShares/BMO factsheets (Q1 2026).

**Acceptance:** Table has six columns. Tilt cells render visibly. Headline "the differences are not zero" now matches the data shown.

---

## PR checklist

- [ ] CL-01 to CL-08 all addressed
- [ ] `pnpm build` passes
- [ ] `pnpm lint` passes
- [ ] Home page screenshots taken on 1366×768 and 390×844 (mobile) — included in PR description
- [ ] No new dependencies added
- [ ] No new design tokens added to `:root`
- [ ] The Round 2 `audit.md` is updated to reflect the new state
