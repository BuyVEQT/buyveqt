"use client";

/**
 * CalculatorsClient — the tabbed shell for /calculators.
 *
 * Wraps the four calculators (Lookback, DCA, TFSA/RRSP, FIRE) behind a
 * single-active tab. URL state ?tab=… picks which calc is visible and
 * also drives OG-image previews via `expandParams` (same key the
 * individual calcs already write back to the URL on input change).
 *
 * Each calculator is lazy-loaded via next/dynamic so we only ship the
 * bundle for the active one.
 */
import { useCallback, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { HistoricalData } from "@/lib/data/types";
import CalcTabs, { type CalcTabId, CALC_TABS } from "./CalcTabs";

const Lookback = dynamic(() => import("./Lookback"), {
  loading: () => <CalcSkeleton />,
});
const DCACalculator = dynamic(() => import("./DCACalculator"), {
  loading: () => <CalcSkeleton />,
});
const TFSARRSPCalculator = dynamic(() => import("./TFSARRSPCalculator"), {
  loading: () => <CalcSkeleton />,
});
const FIRECalculator = dynamic(() => import("./FIRECalculator"), {
  loading: () => <CalcSkeleton />,
});

function CalcSkeleton() {
  return (
    <div
      className="skeleton"
      style={{
        height: 520,
        borderRadius: 14,
        margin: "30px 0 18px",
      }}
      aria-label="Loading calculator…"
    />
  );
}

function isCalcTabId(v: string | null): v is CalcTabId {
  return v === "historical" || v === "dca" || v === "tfsa-rrsp" || v === "fire";
}

interface CalculatorsClientProps {
  history: HistoricalData | null;
}

export default function CalculatorsClient({ history }: CalculatorsClientProps) {
  return (
    <Suspense fallback={<CalcSkeleton />}>
      <CalculatorsClientInner history={history} />
    </Suspense>
  );
}

function CalculatorsClientInner({ history }: CalculatorsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const tabParam = params.get("tab");
  const active: CalcTabId = isCalcTabId(tabParam) ? tabParam : "historical";

  const setTab = useCallback(
    (id: CalcTabId) => {
      const sp = new URLSearchParams(params.toString());
      sp.set("tab", id);
      // Drop calc-specific params from the previous tab so the URL doesn't
      // accumulate stale state when the user jumps between calculators.
      // Each calc rehydrates from URL on mount, then overwrites its own
      // keys — leftover keys from sibling calcs do no harm but read messy.
      for (const k of [
        "amount", "monthly", "horizon", "starting", "annual",
        "expenses", "withdrawalRate", "portfolio", "yearsToFire",
        "coastFire", "rate", "contributions", "contributed",
        "growth", "result", "start", "mode", "account", "returnPct",
      ]) {
        sp.delete(k);
      }
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  const activeMeta = useMemo(
    () => CALC_TABS.find((t) => t.id === active) ?? CALC_TABS[0],
    [active]
  );

  return (
    <>
      <CalcTabs value={active} onChange={setTab} />

      <div
        id={`calc-panel-${active}`}
        role="tabpanel"
        aria-label={`${activeMeta.label} calculator`}
      >
        {active === "historical" && <Lookback history={history} />}
        {active === "dca" && <DCACalculator />}
        {active === "tfsa-rrsp" && <TFSARRSPCalculator />}
        {active === "fire" && <FIRECalculator />}
      </div>
    </>
  );
}
