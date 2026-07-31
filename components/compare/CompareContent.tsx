"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
@media (max-width: 640px) {
  .ins-cmp-page {
    gap: 22px;
    padding: 0 20px 28px;
  }
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
 *   EditorVerdict   the curated verdict for the selected bout
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

  return (
    <main className="ins-root ins-cmp-main">
      <div className="ins-cmp-page">
        <CompareHero contender={contender} onSelect={handleSelect} />

        <Scoreboard
          contender={contender}
          quotes={quotes}
          metrics={metricsByBout[contender]}
        />

        <EditorVerdict contender={contender} />

        <OtherBouts
          contender={contender}
          metricsByBout={metricsByBout}
          onSelect={handleSelect}
        />

        <CompareCloser />

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
