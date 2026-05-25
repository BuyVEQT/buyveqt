"use client";

/**
 * TFSARRSPCalculator (V2) — account-type chips + starting balance + annual
 * contribution + horizon. Projects each of the three scenarios using a
 * lump-sum + monthly stream (annual / 12 spread evenly).
 *
 * Captions change with the account to highlight the right tax envelope:
 *   TFSA — tax-free growth, 2026 cap $7,000/yr
 *   RRSP — tax-deferred, deductible up to limit
 *   FHSA — tax-free for first home, $8k/yr to $40k lifetime
 *
 * URL state mirrors the long-key params so OG-image previews keep working.
 */
import { useState, useMemo, useEffect } from "react";
import {
  SCENARIOS,
  SCENARIO_KEYS,
  fmtCAD,
  projectGrowth,
  type ScenarioKey,
} from "@/lib/calc-data";
import { expandParams } from "@/lib/share-params";
import CalculatorCard from "./CalculatorCard";
import NumberInput from "./NumberInput";
import SegmentedControl from "./SegmentedControl";
import { AdvToggle } from "./AdvancedPanel";
import { usePinnedScenarios } from "./PinnedScenariosBar";
import type { ProjectionPathSet } from "@/components/charts/ProjectionChart";

type AccountKind = "TFSA" | "RRSP" | "FHSA";

interface TFSAInputs {
  account: AccountKind;
  starting: number;
  annual: number;
  horizon: number;
  active: ScenarioKey;
  adjustInflation: boolean;
}

const DEFAULTS: TFSAInputs = {
  account: "TFSA",
  starting: 10000,
  annual: 7000,
  horizon: 25,
  active: "realistic",
  adjustInflation: false,
};

const ANNUAL_CAP: Record<AccountKind, number> = {
  TFSA: 7000,
  FHSA: 8000,
  RRSP: 32000,
};

export default function TFSARRSPCalculator() {
  const [account, setAccount] = useState<AccountKind>(DEFAULTS.account);
  const [starting, setStarting] = useState(DEFAULTS.starting);
  const [annual, setAnnual] = useState(DEFAULTS.annual);
  const [horizon, setHorizon] = useState(DEFAULTS.horizon);
  const [active, setActive] = useState<ScenarioKey>(DEFAULTS.active);
  const [adjustInflation, setAdjustInflation] = useState(DEFAULTS.adjustInflation);
  const { pinned, pin, remove, restore } = usePinnedScenarios<TFSAInputs>(3);

  // Hydrate from URL (share-link landings + OG previews).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      raw[k] = v;
    });
    const p = expandParams(raw);
    const acc = typeof p.account === "string" ? p.account.toUpperCase() : null;
    if (acc === "TFSA" || acc === "RRSP" || acc === "FHSA") setAccount(acc);
    const s = typeof p.starting === "string" ? Number(p.starting) : NaN;
    if (Number.isFinite(s) && s >= 0 && s <= 10_000_000) setStarting(Math.round(s));
    const a = typeof p.annual === "string" ? Number(p.annual) : NaN;
    if (Number.isFinite(a) && a >= 0 && a <= 100_000) setAnnual(Math.round(a));
    const h = typeof p.horizon === "string" ? Number(p.horizon) : NaN;
    if (Number.isFinite(h) && h >= 1 && h <= 50) setHorizon(Math.round(h));
  }, []);

  const monthly = annual / 12;

  const paths: ProjectionPathSet = useMemo(() => {
    const months = horizon * 12;
    const out = {} as ProjectionPathSet;
    for (const key of SCENARIO_KEYS) {
      const rate = SCENARIOS[key].rate - (adjustInflation ? 0.025 : 0);
      out[key] = projectGrowth({ lumpSum: starting, monthly, months, annualRate: rate });
    }
    return out;
  }, [starting, monthly, horizon, adjustInflation]);

  const baseline = useMemo(
    () =>
      paths.realistic.path.map((p) => ({ month: p.month, balance: p.contributed })),
    [paths]
  );

  // Push state into the URL for OG previews.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const sp = url.searchParams;
    sp.set("tab", "tfsa-rrsp");
    sp.set("account", account);
    sp.set("starting", String(starting));
    sp.set("annual", String(annual));
    sp.set("horizon", String(horizon));
    sp.set("rate", String((SCENARIOS[active].rate * 100).toFixed(1)));
    sp.set("result", String(Math.round(paths[active].final)));
    window.history.replaceState(null, "", `${url.pathname}?${sp.toString()}${url.hash}`);
  }, [account, starting, annual, horizon, active, paths]);

  function resetAll() {
    setAccount(DEFAULTS.account);
    setStarting(DEFAULTS.starting);
    setAnnual(DEFAULTS.annual);
    setHorizon(DEFAULTS.horizon);
    setActive(DEFAULTS.active);
    setAdjustInflation(DEFAULTS.adjustInflation);
  }

  function pinCurrent() {
    pin({
      label: `${account} · ${fmtCAD(starting)} + ${fmtCAD(annual)}/y`,
      value: paths[active].final,
      inputs: { account, starting, annual, horizon, active, adjustInflation },
    });
  }

  function restoreScenario(i: number) {
    const inp = restore(i);
    if (!inp) return;
    setAccount(inp.account);
    setStarting(inp.starting);
    setAnnual(inp.annual);
    setHorizon(inp.horizon);
    setActive(inp.active);
    setAdjustInflation(inp.adjustInflation);
  }

  const accountCaption =
    account === "TFSA"
      ? "Tax-free growth · 2026 cap $7,000/yr"
      : account === "RRSP"
      ? "Tax-deferred growth · deductible up to limit"
      : "Tax-free for first home · $8,000/yr to $40,000 lifetime";

  return (
    <CalculatorCard<TFSAInputs>
      number="03"
      name="Account growth"
      anchorId="tfsa"
      title={
        <>
          Your{" "}
          <em style={{ fontStyle: "italic", fontWeight: 500 }}>{account}</em> with VEQT.
        </>
      }
      tagline={accountCaption}
      paths={paths}
      activeKey={active}
      setActiveKey={setActive}
      baseline={baseline}
      pinned={pinned}
      onPin={pinCurrent}
      onRemove={remove}
      onRestore={restoreScenario}
      onReset={resetAll}
      advancedContent={
        <AdvToggle
          label="Adjust for inflation"
          sub="Subtract 2.5% from the assumed return rate"
          value={adjustInflation}
          onChange={setAdjustInflation}
        />
      }
      controls={
        <>
          <SegmentedControl<AccountKind>
            label="Account"
            value={account}
            options={[
              { value: "TFSA", label: "TFSA" },
              { value: "RRSP", label: "RRSP" },
              { value: "FHSA", label: "FHSA" },
            ]}
            onChange={(next) => {
              setAccount(next);
              const cap = ANNUAL_CAP[next];
              if (annual > cap) setAnnual(cap);
            }}
          />
          <NumberInput
            label="Starting balance"
            value={starting}
            onChange={setStarting}
            prefix="$"
            step={1000}
            min={0}
            max={10_000_000}
          />
          <NumberInput
            label="Annual contribution"
            value={annual}
            onChange={setAnnual}
            prefix="$"
            step={500}
            min={0}
            max={ANNUAL_CAP[account]}
          />
          <NumberInput
            label="Years"
            value={horizon}
            onChange={setHorizon}
            suffix="yrs"
            step={1}
            min={1}
            max={50}
          />
        </>
      }
    />
  );
}
