# Prompt — Teardown: /invest (cohort fan)

Copy verbatim into Claude Code at the **root of the buyveqt-main repo**. **M1 must be merged first.**

---

You are working on the `buyveqt-main` repo. Read these files in order:

1. `design_handoff_round3/README.md`
2. `design_handoff_round3/00-context.md`
3. `design_handoff_round3/21-teardown-invest.md`

Also read:
- `app/invest/page.tsx` — current calculator page
- `components/InvestCalculator.tsx` (or wherever the calculator inputs live) — extend; preserve the input UX
- `lib/veqt-data.ts` — for the daily-close data the cohort math needs
- `components/broadsheet/SeverityMeter.tsx` — you're mounting `<SeverityMeter compact />` on this page (the `compact` prop comes from CL-06 in M1)

Then implement `21-teardown-invest.md`:

1. **Math first.** Implement `computeCohorts` in `lib/calculators.ts`:

   ```ts
   export function computeCohorts(
     mode: "lumpsum" | "dca",
     amount: number,
     durationMonths: number,   // 0 for lumpsum
     series: PricePoint[]
   ): Cohort[]
   ```

   **Test it** with a hand-computed example. For lump-sum: $10,000 invested at $25 (launch price) and held to today at $42.61 should yield $17,044. For DCA, write a small unit test or assertion you can run.

2. **The component:** `components/invest/CohortFan.tsx`. Renders all cohort lines in `--rule` 0.5px, the median in `--ink` 1px dashed, the user's cohort in `--stamp` 2px. SVG hand-built.

3. **The output panel:** Replace the current single-number output with:
   - Headline (computed, e.g. "You started in March 2020. $10,000 is now $24,310.")
   - The CohortFan SVG
   - Three-number stat strip: median / your cohort / worst case
   - One-sentence percentile summary

4. **Mount `<SeverityMeter compact />` above the calculator.**

5. Apply this to **both calculators** — lump-sum and DCA. Same component, different `mode` prop.

Constraints:

- The percentile sentence is computed correctly. "71 of 84 cohorts did better than yours" must reflect the actual rank of the user's cohort among all completed cohorts. Off-by-one bugs here destroy trust.
- No new dependencies. SVG hand-built.
- No new design tokens.
- The input form's UX is preserved. Only the **output side** of the page changes.
- Mobile: the fan chart shrinks; the stat strip stacks vertically.

Workflow:

1. Branch: `feature/cohort-fan-calculators`.
2. `lib/calculators.ts` + tests first. Show your test output in the PR.
3. CohortFan component in isolation.
4. Wire to lump-sum calculator. Test with several start dates including: launch (best case), Feb 2022 (worst case), March 2020 (covid bottom), today (n/a, completed cohort = 0 days).
5. Wire to DCA calculator. Verify with at least one durationMonths ≥ 60.
6. Mount SeverityMeter compact.
7. Screenshots at 1366×768 and 390 mobile, with three different scenarios on each.

Stop and ask if:
- For the DCA mode, you're unsure whether to include incomplete cohorts (started recently, haven't yet completed `durationMonths`). Default: exclude them, but ask before locking in.
- The "worst case cohort" is more than 24 months in the past — verify, because some scenarios will surface a worst case that's just "started two months ago and hasn't recovered" which is misleading.
