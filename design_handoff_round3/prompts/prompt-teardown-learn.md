# Prompt — Teardown: /learn (three courses)

Copy verbatim into Claude Code at the **root of the buyveqt-main repo**. **M1 must be merged first.**

---

You are working on the `buyveqt-main` repo. Read these files in order:

1. `design_handoff_round3/README.md`
2. `design_handoff_round3/00-context.md`
3. `design_handoff_round3/22-teardown-learn.md`

Also read:
- `app/learn/page.tsx` — current page
- `components/learn/LearnContent.tsx` — current grouped/filtered content
- `app/learn/[slug]/` (or however articles are routed) — to verify which slugs exist

Then implement `22-teardown-learn.md`:

1. **Audit slug existence.** For each slug in the `COURSES` definition (in the doc), verify the article exists. List missing slugs in your PR description. For each missing one, **either** stub a placeholder MDX/article that 404-prevents the link, **or** substitute an existing slug from the current archive that fits the same role. Do not ship dead links.

2. **Create `lib/learn.ts`** exporting `COURSES` per the doc. Both the home page and `/learn` import from here.

3. **Restructure `/learn`:**
   - Lead block ("Three courses. Three articles each. In order.")
   - Course grid: three CourseCard components side by side
   - Rule
   - Eyebrow: "Everything else, by topic"
   - The existing grouped/filtered archive, **demoted** — smaller h3s, ink-soft instead of ink, tighter spacing

4. **Update the home page (CL-07 follow-through).** The Step 1/2/3 block from M1 now imports from `COURSES[0]` (Course 1: "What VEQT actually is"). If CL-07 used a separate inline triplet, refactor to import from `lib/learn.ts`.

5. **Component:** `components/learn/CourseCard.tsx` per the visual in the doc.

Constraints:

- No new design tokens.
- No new article content. Stubs are fine; full writing is out of scope.
- Filter rail and category groupings stay functional in the demoted archive — don't break navigation paths users may have bookmarked.
- Server components throughout (no client interactivity in the courses block).

Workflow:

1. Branch: `feature/learn-three-courses`.
2. Slug audit first. Post the audit results in the PR description before writing components.
3. `lib/learn.ts` + CourseCard component.
4. Restructure `/learn`.
5. Refactor home page Step 1/2/3 block to import from `lib/learn.ts`.
6. Screenshots at 1366×768 and 390 mobile.
7. Click through every link on `/learn` to verify no 404s.

Stop and ask if:
- More than half the proposed slugs are missing (suggests course curation needs editorial input first).
- The current `/learn` page has features users depend on (e.g., a search box, an RSS feed) that the demoted archive would orphan — confirm what to preserve.
