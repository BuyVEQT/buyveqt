"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getComparison } from "@/data/comparisons";
import {
  BOUTS,
  DEFAULT_BOUT,
  HOUSE_TICKER,
  boutFromFunds,
  getBout,
} from "./bouts";
import { pairMetrics, type PairMetrics } from "./compare-math";
import useBoutData from "./useBoutData";
import CompareHero from "./CompareHero";
import Scoreboard from "./Scoreboard";
import EditorVerdict from "./EditorVerdict";
import OtherBouts from "./OtherBouts";
import CompareCloser from "./CompareCloser";
import FAQSection from "./FAQSection";

const css = `
.ins-cmp-main {
  background: var(--ins-paper, #ffffff);
  color: var(--ins-ink, #111111);
  font-family: var(--ins-font);
  min-height: 100dvh;
}
.ins-cmp-page {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 40px;
}
/* The editor's verdict plus its one outbound: the deep link to the
   written-up page for the bout currently on the board. Wrapped so the
   link rides 14px under the verdict rather than the page's 30px gap. */
/* Gap goes to zero because the link below now carries a 44px tap box
   whose top ~29px is empty — stacking a 14px gap on that would double
   the space the design asks for. */
.ins-cmp-verdict {
  display: flex;
  flex-direction: column;
  gap: 0;
}
/* LABEL (link text), already at the floor. The tap box is new:
   inline-flex with the content bottom-aligned, so the 2px rule — a
   border on the link box itself — stays 3px under the type instead of
   floating below a centred line, and the added height sits above the
   text where it overlaps nothing clickable. */
.ins-cmp-verdict__more {
  align-self: start;
  display: inline-flex;
  align-items: flex-end;
  /* Replaces the word space flex drops between the label and its
     arrow, tracking included. */
  column-gap: 0.4em;
  min-height: 44px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-ink);
  text-decoration: none;
  border-bottom: 2px solid var(--ins-ink);
  padding-bottom: 3px;
}
.ins-cmp-verdict__more:hover,
.ins-cmp-verdict__more:focus-visible {
  color: var(--ins-signal);
  border-bottom-color: var(--ins-signal);
}

@media (max-width: 640px) {
  .ins-cmp-page {
    gap: 22px;
    padding: 0 20px 28px;
  }
  .ins-cmp-verdict { gap: 0; }
  .ins-cmp-verdict__more { font-size: 10px; letter-spacing: 0.14em; }
}
`;

interface CompareContentProps {
  /** Set by `/compare/[slug]` pages — pins the bout that page is about. */
  initialFunds?: string[];
}

function parseFundsParam(raw: string | null): string[] | null {
  if (!raw) return null;
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : null;
}

/**
 * /compare — The Instrument (artboard 6b).
 *
 *   CompareHero     kicker · "VEQT × the field." · dek · TONIGHT'S BOUT tabs
 *   Scoreboard      two mastheads, MER first, common tape, spread, the rail
 *   EditorVerdict   the curated verdict for the selected bout, plus the
 *                   deep link to that bout's written-up page (suppressed
 *                   when we're already on it)
 *   OtherBouts      the five contenders not on the board, 02–06
 *   CompareCloser   "Still here?" + RUN THE FEE MATH
 *   FAQSection      COMPARE_FAQ in the article grammar
 *
 * URL state: `?funds=VEQT.TO,{contender}` — the same parameter the
 * previous page wrote, so old links, the `[slug]` pages and anything
 * pointing at /compare?funds=… still resolve to the right bout. Other
 * query parameters (e.g. a legacy `period`) are carried through
 * untouched.
 */
function CompareContentInner({ initialFunds }: CompareContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [contender, setContender] = useState<string>(
    () =>
      boutFromFunds(initialFunds) ??
      boutFromFunds(parseFundsParam(params.get("funds"))) ??
      DEFAULT_BOUT
  );

  // Sync state → URL (replaceState so bout switching doesn't stack history).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const next = new URLSearchParams(window.location.search);
    next.set("funds", `${HOUSE_TICKER},${contender}`);
    const qs = next.toString();
    if (window.location.search !== `?${qs}`) {
      router.replace(`${pathname}?${qs}`, { scroll: false });
    }
  }, [contender, pathname, router]);

  const handleSelect = useCallback((ticker: string) => {
    if (getBout(ticker)) setContender(ticker);
  }, []);

  const { quotes, histories } = useBoutData(contender);

  // The written-up page for the bout on the board, when one exists — and
  // never a link to the page we're already standing on.
  const writeUpHref = useMemo(() => {
    const bout = getBout(contender);
    if (!bout) return null;
    const href = `/compare/veqt-vs-${bout.short.toLowerCase()}`;
    if (!getComparison(href.slice("/compare/".length))) return null;
    return href === pathname ? null : href;
  }, [contender, pathname]);

  // One common-tape computation per bout — the scoreboard reads its own,
  // the fight card below reads the other five.
  const metricsByBout = useMemo<Record<string, PairMetrics>>(() => {
    const house = histories[HOUSE_TICKER] ?? [];
    const out: Record<string, PairMetrics> = {};
    for (const bout of BOUTS) {
      out[bout.ticker] = pairMetrics(house, histories[bout.ticker] ?? []);
    }
    return out;
  }, [histories]);

  /* Red discipline (build contract §6) — the closer's CTA goes ink when a
     negative stat is on screen with it. Every bout's spread is rendered
     above the closer (the selected one by Scoreboard, the other five by
     OtherBouts), and each prints red when negative, so "any spread below
     zero" is exactly the set of states where a red CTA would be sharing
     the viewport with signal red. */
  const negativeSpreadInView = useMemo(
    () =>
      BOUTS.some((b) => {
        const s = metricsByBout[b.ticker]?.spreadPp;
        return s != null && s < 0;
      }),
    [metricsByBout]
  );

  return (
    <main className="ins-root ins-cmp-main">
      <div className="ins-cmp-page">
        <CompareHero contender={contender} onSelect={handleSelect} />

        <Scoreboard
          contender={contender}
          quotes={quotes}
          metrics={metricsByBout[contender]}
        />

        <div className="ins-cmp-verdict">
          <EditorVerdict contender={contender} />
          {writeUpHref && (
            <Link href={writeUpHref} className="ins-cmp-verdict__more">
              The full write-up <span aria-hidden>&rarr;</span>
            </Link>
          )}
        </div>

        <OtherBouts
          contender={contender}
          metricsByBout={metricsByBout}
          onSelect={handleSelect}
        />

        <CompareCloser negativeStatInView={negativeSpreadInView} />

        <FAQSection />
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </main>
  );
}

/**
 * Suspense wrapper — useSearchParams() bails static prerendering without
 * a Suspense boundary, so we split the inner client from the export.
 */
export default function CompareContent(props: CompareContentProps) {
  return (
    <Suspense
      fallback={
        <main
          style={{
            background: "var(--ins-paper, #ffffff)",
            minHeight: "60dvh",
          }}
        />
      }
    >
      <CompareContentInner {...props} />
    </Suspense>
  );
}
