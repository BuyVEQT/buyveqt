# Prompt — M1 cleanup PR

Copy this verbatim into Claude Code at the **root of the buyveqt-main repo**.

---

You are working on the `buyveqt-main` repo (Next.js, React, TypeScript, Tailwind v4). Read these files first, in order:

1. `design_handoff_round3/README.md`
2. `design_handoff_round3/00-context.md`
3. `design_handoff_round3/01-cleanup-pr.md`

Then execute every ticket in `01-cleanup-pr.md` (CL-01 through CL-08) as **a single PR**. Constraints:

- No new dependencies.
- No new design tokens in `:root` of `app/globals.css`.
- Do not touch `Masthead.tsx`, `VolatilityHeatmap.tsx`, or `EditionRecommends.tsx` beyond what the tickets explicitly require.
- After CL-03 migrates all `card-editorial` consumers, **then** delete the CSS in CL-02. Do not delete CSS that's still referenced.
- For CL-04 (italics audit), preserve text content; only remove the `bs-display-italic` class.
- For CL-05 (vermilion discipline), the goal is that `var(--stamp)` only appears in roles that mark "today's notable signal." Audit your work by grepping for `--stamp` and reviewing each call site.

Workflow:
1. Run `pnpm install` and `pnpm build` to confirm a clean baseline.
2. Create a feature branch: `cleanup/round-2-loose-threads`.
3. Work the tickets in this order: CL-01 → CL-04 → CL-06 → CL-07 → CL-08 → CL-03 → CL-02 → CL-05.
   (CL-04, 06, 07, 08 are independent. CL-03 must precede CL-02. CL-05 last so visual review is on a clean tree.)
4. After each ticket, run `pnpm build` and `pnpm lint`.
5. Take screenshots of `/`, `/compare`, `/learn`, `/invest`, `/distributions` on 1366×768 and 390×844 viewports.
6. Update `audit.md` to reflect the cleaned state.
7. Open the PR with the screenshots and a checklist matching the one at the end of `01-cleanup-pr.md`.

Do not start M2/M3/M4 work until M1 is merged.

If anything is ambiguous, **stop and ask** before guessing. Specifically: if `card-editorial` consumers don't have an obvious broadsheet replacement, ask which primitive to migrate to; if a `bs-display-italic` removal would change a deliberate stylistic choice on the lead headline, confirm it stays.
