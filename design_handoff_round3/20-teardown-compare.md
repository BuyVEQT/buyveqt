# 20 — Teardown: `/compare`

**Status:** Subsumed by Bet 02 (`11-bet-compare-rebuild.md`).

This page is rebuilt as part of the bet. There are no separate compare-page tickets in Round 3 beyond what `11-bet-compare-rebuild.md` specifies.

## What was wrong (for the record)

- Lead headline ("the differences are not zero") wasn't supported by the table below it.
- The table compared **MERs** (effectively identical), **AUMs** (a meaningless metric for retail investors), and **inception years**. None of these tell a story.
- The actually-interesting comparable — **regional tilt** — wasn't shown at all, despite CSS scaffolding for `.bs-tilt-bar` existing in `globals.css`.
- The page read like a Wikipedia summary, not a piece of editorial.

## What replaces it

See `11-bet-compare-rebuild.md`. Three event columns above the fold, tilt comparison, closing line, demoted spec table.
