"use client";

/**
 * TFSARRSPCalculator (V2) — account-type chips + starting balance + annual
 * contribution + horizon. Projects each of the three scenarios using a
 * lump-sum + monthly stream (annual / 12 spread evenly).
 *
 * Per-account depth additions:
 *   TFSA — contribution-room tracker (birth year + past contributions),
 *          remaining-room progress bar, over-contribution warnings.
 *   RRSP — marginal-rate refund estimate, expected retirement tax rate,
 *          after-tax projection, reinvest-refund toggle that adds the
 *          annual refund to monthly contributions.
 *   FHSA — lifetime-cap tracker ($40K/$8K-per-year), 15-year window note.
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
import {
  computeTFSARoom,
  computeFHSARoom,
  FHSA_ANNUAL_LIMIT,
} from "@/data/tfsa-limits";
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
  /** Marginal tax bracket — used to estimate the RRSP refund. */
  marginalRate: number;
  /** Expected retirement tax bracket — used for RRSP after-tax view. */
  retirementRate: number;
  /** Auto-reinvest the RRSP refund as extra monthly contributions. */
  reinvestRefund: boolean;
  /** Birth year — drives TFSA cumulative room calc. */
  birthYear: number;
  /** Past TFSA contributions to date. */
  pastTFSA: number;
  /** Past FHSA contributions to date. */
  pastFHSA: number;
}

const DEFAULTS: TFSAInputs = {
  account: "TFSA",
  starting: 10000,
  annual: 7000,
  horizon: 25,
  active: "realistic",
  adjustInflation: false,
  marginalRate: 30,
  retirementRate: 22,
  reinvestRefund: false,
  birthYear: 1990,
  pastTFSA: 0,
  pastFHSA: 0,
};

const ANNUAL_CAP: Record<AccountKind, number> = {
  TFSA: 7000,
  FHSA: FHSA_ANNUAL_LIMIT,
  RRSP: 32000,
};

export default function TFSARRSPCalculator() {
  const [account, setAccount] = useState<AccountKind>(DEFAULTS.account);
  const [starting, setStarting] = useState(DEFAULTS.starting);
  const [annual, setAnnual] = useState(DEFAULTS.annual);
  const [horizon, setHorizon] = useState(DEFAULTS.horizon);
  const [active, setActive] = useState<ScenarioKey>(DEFAULTS.active);
  const [adjustInflation, setAdjustInflation] = useState(DEFAULTS.adjustInflation);
  const [marginalRate, setMarginalRate] = useState(DEFAULTS.marginalRate);
  const [retirementRate, setRetirementRate] = useState(DEFAULTS.retirementRate);
  const [reinvestRefund, setReinvestRefund] = useState(DEFAULTS.reinvestRefund);
  const [birthYear, setBirthYear] = useState(DEFAULTS.birthYear);
  const [pastTFSA, setPastTFSA] = useState(DEFAULTS.pastTFSA);
  const [pastFHSA, setPastFHSA] = useState(DEFAULTS.pastFHSA);
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

  // RRSP refund math: contributing `annual` to the RRSP reduces taxable
  // income by `annual`, refunding `annual × marginalRate`. Reinvesting it
  // means the effective annual contribution becomes annual × (1 + bracket).
  const annualRefund = account === "RRSP" ? annual * (marginalRate / 100) : 0;
  const effectiveAnnual =
    account === "RRSP" && reinvestRefund ? annual + annualRefund : annual;
  const monthly = effectiveAnnual / 12;

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
    setMarginalRate(DEFAULTS.marginalRate);
    setRetirementRate(DEFAULTS.retirementRate);
    setReinvestRefund(DEFAULTS.reinvestRefund);
    setBirthYear(DEFAULTS.birthYear);
    setPastTFSA(DEFAULTS.pastTFSA);
    setPastFHSA(DEFAULTS.pastFHSA);
  }

  function pinCurrent() {
    pin({
      label: `${account} · ${fmtCAD(starting)} + ${fmtCAD(annual)}/y`,
      value: paths[active].final,
      inputs: {
        account, starting, annual, horizon, active, adjustInflation,
        marginalRate, retirementRate, reinvestRefund,
        birthYear, pastTFSA, pastFHSA,
      },
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
    if (inp.marginalRate !== undefined) setMarginalRate(inp.marginalRate);
    if (inp.retirementRate !== undefined) setRetirementRate(inp.retirementRate);
    if (inp.reinvestRefund !== undefined) setReinvestRefund(inp.reinvestRefund);
    if (inp.birthYear !== undefined) setBirthYear(inp.birthYear);
    if (inp.pastTFSA !== undefined) setPastTFSA(inp.pastTFSA);
    if (inp.pastFHSA !== undefined) setPastFHSA(inp.pastFHSA);
  }

  // Per-account depth computations.
  const tfsaRoom = useMemo(
    () => computeTFSARoom(birthYear, pastTFSA),
    [birthYear, pastTFSA]
  );
  const fhsaRoom = useMemo(() => computeFHSARoom(pastFHSA), [pastFHSA]);

  const finalValue = paths[active].final;
  const contributed = paths[active].contributed;
  const growth = finalValue - contributed;

  // RRSP: tax owed on withdrawal at retirement rate, and the after-tax
  // value the user actually keeps. Compared against an equivalent TFSA
  // build (no withdrawal tax) to highlight the bracket spread.
  const totalRefund = annualRefund * horizon;
  const afterTaxValue =
    account === "RRSP"
      ? finalValue * (1 - retirementRate / 100)
      : finalValue;
  const taxOwed = account === "RRSP" ? finalValue - afterTaxValue : 0;
  const bracketSpread = marginalRate - retirementRate;

  // TFSA: capital-gains tax saved versus a taxable account. CRA includes
  // 50% of capital gains at the marginal rate, so the rough estimate of
  // tax avoided is growth × 0.5 × marginal.
  const taxSavedTFSA =
    account === "TFSA" ? growth * 0.5 * (marginalRate / 100) : 0;

  const exceedsTFSARoom =
    account === "TFSA" && annual > tfsaRoom.remaining;
  const exceedsFHSARoom =
    account === "FHSA" && pastFHSA + annual > fhsaRoom.lifetimeLimit;

  const accountCaption =
    account === "TFSA"
      ? `Tax-free growth · ${fmtCAD(tfsaRoom.currentYearLimit, 0)}/yr cap`
      : account === "RRSP"
      ? `Tax-deferred · ~${fmtCAD(annualRefund, 0)}/yr refund at ${marginalRate}% bracket`
      : `Tax-free for first home · ${fmtCAD(FHSA_ANNUAL_LIMIT, 0)}/yr to ${fmtCAD(40000, 0)} lifetime`;

  // ─── Per-account "above chart" panels ─────────────────────────
  const aboveChart = (() => {
    if (account === "TFSA") {
      return (
        <div className={`room${tfsaRoom.isOverContributed ? " is-over" : exceedsTFSARoom ? " is-warn" : ""}`}>
          <div className="room__top">
            <span className="ed-label room__lab">
              TFSA contribution room
            </span>
            <span className="room__pct">
              {tfsaRoom.usedPct.toFixed(0)}% used
            </span>
          </div>
          <div className="room__bar" aria-hidden>
            <div
              className="room__fill"
              style={{ width: `${Math.min(100, tfsaRoom.usedPct)}%` }}
            />
          </div>
          <div className="room__row">
            <span className="room__num ed-numerals">
              {fmtCAD(tfsaRoom.remaining, 0)}
            </span>
            <span className="room__cap">
              remaining of {fmtCAD(tfsaRoom.lifetimeLimit, 0)} lifetime
              {" · "}eligible since {tfsaRoom.firstEligibleYear}
            </span>
          </div>
          {tfsaRoom.isOverContributed && (
            <div className="room__alert room__alert--err">
              Over-contribution detected. CRA charges 1% per month on the excess.
            </div>
          )}
          {!tfsaRoom.isOverContributed && exceedsTFSARoom && (
            <div className="room__alert room__alert--warn">
              Your {fmtCAD(annual, 0)} annual plan exceeds {fmtCAD(tfsaRoom.remaining, 0)} of available room.
            </div>
          )}
          <RoomStyles />
        </div>
      );
    }
    if (account === "RRSP") {
      return (
        <div className="rrsp-callouts">
          <div className="rrsp-callouts__grid">
            <div className="rrsp-callout">
              <div className="ed-label rrsp-callout__lab">Annual refund</div>
              <div className="rrsp-callout__val ed-numerals">
                {fmtCAD(annualRefund, 0)}
              </div>
              <div className="ed-caption rrsp-callout__cap">
                {fmtCAD(annual, 0)} × {marginalRate}% bracket
              </div>
            </div>
            <div className="rrsp-callout">
              <div className="ed-label rrsp-callout__lab">
                Bracket spread
              </div>
              <div
                className={`rrsp-callout__val ed-numerals${
                  bracketSpread >= 0 ? " is-good" : " is-bad"
                }`}
              >
                {bracketSpread >= 0 ? "+" : ""}
                {bracketSpread}%
              </div>
              <div className="ed-caption rrsp-callout__cap">
                {bracketSpread > 0
                  ? "RRSP advantage — save at a higher rate"
                  : bracketSpread === 0
                  ? "Break even — TFSA is just as good"
                  : "TFSA may be better at this spread"}
              </div>
            </div>
          </div>
          {reinvestRefund && (
            <div className="rrsp-callouts__chip">
              Reinvesting the refund: your effective monthly contribution is{" "}
              <strong>{fmtCAD(monthly, 0)}</strong> (vs {fmtCAD(annual / 12, 0)} without).
            </div>
          )}
          <RRSPStyles />
        </div>
      );
    }
    if (account === "FHSA") {
      return (
        <div className={`room${fhsaRoom.isOverContributed ? " is-over" : exceedsFHSARoom ? " is-warn" : ""}`}>
          <div className="room__top">
            <span className="ed-label room__lab">
              FHSA lifetime room
            </span>
            <span className="room__pct">
              {fhsaRoom.usedPct.toFixed(0)}% used
            </span>
          </div>
          <div className="room__bar" aria-hidden>
            <div
              className="room__fill"
              style={{ width: `${Math.min(100, fhsaRoom.usedPct)}%` }}
            />
          </div>
          <div className="room__row">
            <span className="room__num ed-numerals">
              {fmtCAD(fhsaRoom.remaining, 0)}
            </span>
            <span className="room__cap">
              remaining of {fmtCAD(fhsaRoom.lifetimeLimit, 0)} lifetime ·{" "}
              {fhsaRoom.maxYears}-year window to use for a first home
            </span>
          </div>
          {fhsaRoom.isOverContributed && (
            <div className="room__alert room__alert--err">
              Over-contribution detected. Withdraw the excess to avoid a 1%/month penalty.
            </div>
          )}
          {!fhsaRoom.isOverContributed && exceedsFHSARoom && (
            <div className="room__alert room__alert--warn">
              Adding {fmtCAD(annual, 0)} would push you past the {fmtCAD(40000, 0)} lifetime cap.
            </div>
          )}
          <RoomStyles />
        </div>
      );
    }
    return null;
  })();

  // ─── "Below chart" depth strip — account-specific tax math ─────
  const belowChart = (
    <div className="tax-depth">
      {account === "RRSP" ? (
        <>
          <div className="tax-depth__cell">
            <div className="ed-label">Refunds over horizon</div>
            <div className="tax-depth__val tax-depth__val--green">
              {fmtCAD(totalRefund, 0)}
            </div>
            <div className="ed-caption tax-depth__cap">
              {horizon} years × {fmtCAD(annualRefund, 0)}/yr at {marginalRate}%
            </div>
          </div>
          <div className="tax-depth__cell">
            <div className="ed-label">After-tax value</div>
            <div className="tax-depth__val">
              {fmtCAD(afterTaxValue, 0)}
            </div>
            <div className="ed-caption tax-depth__cap">
              At {retirementRate}% retirement bracket · keeps {(100 - retirementRate)}¢ per dollar
            </div>
          </div>
          <div className="tax-depth__cell">
            <div className="ed-label">Tax owed at withdrawal</div>
            <div className="tax-depth__val tax-depth__val--stamp">
              {fmtCAD(taxOwed, 0)}
            </div>
            <div className="ed-caption tax-depth__cap">
              {fmtCAD(finalValue, 0)} pre-tax × {retirementRate}%
            </div>
          </div>
        </>
      ) : account === "TFSA" ? (
        <>
          <div className="tax-depth__cell">
            <div className="ed-label">Tax saved vs taxable</div>
            <div className="tax-depth__val tax-depth__val--green">
              {fmtCAD(taxSavedTFSA, 0)}
            </div>
            <div className="ed-caption tax-depth__cap">
              50% inclusion × {marginalRate}% bracket × {fmtCAD(growth, 0)} growth
            </div>
          </div>
          <div className="tax-depth__cell">
            <div className="ed-label">Take-home (TFSA)</div>
            <div className="tax-depth__val">
              {fmtCAD(finalValue, 0)}
            </div>
            <div className="ed-caption tax-depth__cap">
              All of it. No tax on withdrawal.
            </div>
          </div>
          <div className="tax-depth__cell">
            <div className="ed-label">Effective annual rate</div>
            <div className="tax-depth__val tax-depth__val--stamp">
              {fmtCAD(annual, 0)}/yr
            </div>
            <div className="ed-caption tax-depth__cap">
              At {fmtCAD(annual / 12, 0)}/mo · {((annual / (tfsaRoom.currentYearLimit || 7000)) * 100).toFixed(0)}% of {new Date().getFullYear()} cap
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="tax-depth__cell">
            <div className="ed-label">Years to fill</div>
            <div className="tax-depth__val">
              {annual > 0 ? Math.ceil(fhsaRoom.remaining / annual) : "—"} yrs
            </div>
            <div className="ed-caption tax-depth__cap">
              At {fmtCAD(annual, 0)}/yr until you hit {fmtCAD(40000, 0)}
            </div>
          </div>
          <div className="tax-depth__cell">
            <div className="ed-label">Down-payment power</div>
            <div className="tax-depth__val tax-depth__val--green">
              {fmtCAD(finalValue, 0)}
            </div>
            <div className="ed-caption tax-depth__cap">
              Tax-free withdrawal for a qualifying first home
            </div>
          </div>
          <div className="tax-depth__cell">
            <div className="ed-label">Tax saved vs taxable</div>
            <div className="tax-depth__val tax-depth__val--stamp">
              {fmtCAD(growth * 0.5 * (marginalRate / 100), 0)}
            </div>
            <div className="ed-caption tax-depth__cap">
              ~{marginalRate}% bracket × 50% inclusion on {fmtCAD(growth, 0)} growth
            </div>
          </div>
        </>
      )}
      <TaxDepthStyles />
    </div>
  );

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
      aboveChart={aboveChart}
      belowChart={belowChart}
      advancedContent={
        <>
          <AdvToggle
            label="Adjust for inflation"
            sub="Subtract 2.5% from the assumed return rate"
            value={adjustInflation}
            onChange={setAdjustInflation}
          />

          {account === "TFSA" && (
            <>
              <NumberInput
                label="Birth year"
                value={birthYear}
                onChange={setBirthYear}
                step={1}
                min={1940}
                max={2010}
              />
              <NumberInput
                label="Past TFSA contributions"
                value={pastTFSA}
                onChange={setPastTFSA}
                prefix="$"
                step={500}
                min={0}
                max={200_000}
              />
              <NumberInput
                label="Marginal tax bracket"
                value={marginalRate}
                onChange={setMarginalRate}
                suffix="%"
                step={1}
                min={15}
                max={54}
              />
            </>
          )}

          {account === "RRSP" && (
            <>
              <NumberInput
                label="Marginal tax bracket"
                value={marginalRate}
                onChange={setMarginalRate}
                suffix="%"
                step={1}
                min={15}
                max={54}
              />
              <NumberInput
                label="Retirement tax rate"
                value={retirementRate}
                onChange={setRetirementRate}
                suffix="%"
                step={1}
                min={10}
                max={50}
              />
              <AdvToggle
                label="Reinvest the refund"
                sub={`Adds ~${fmtCAD(annualRefund, 0)}/yr to contributions`}
                value={reinvestRefund}
                onChange={setReinvestRefund}
              />
            </>
          )}

          {account === "FHSA" && (
            <>
              <NumberInput
                label="Past FHSA contributions"
                value={pastFHSA}
                onChange={setPastFHSA}
                prefix="$"
                step={500}
                min={0}
                max={40_000}
              />
              <NumberInput
                label="Marginal tax bracket"
                value={marginalRate}
                onChange={setMarginalRate}
                suffix="%"
                step={1}
                min={15}
                max={54}
              />
            </>
          )}
        </>
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

/** Shared styles for the TFSA/FHSA contribution-room panel. */
function RoomStyles() {
  return (
    <style jsx global>{`
      .room {
        margin: -2px 0 18px;
        padding: 14px 16px 12px;
        background: var(--paper);
        border: 1px solid var(--rule-soft);
        border-radius: 10px;
      }
      .room.is-warn {
        border-color: rgba(178, 110, 19, 0.4);
        background: rgba(255, 244, 220, 0.45);
      }
      .room.is-over {
        border-color: rgba(155, 27, 27, 0.45);
        background: rgba(252, 234, 234, 0.5);
      }
      .room__top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 8px;
      }
      .room__lab {
        color: var(--ink-mute);
      }
      .room__pct {
        font-family: var(--font-sans);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: var(--ink);
        font-variant-numeric: tabular-nums lining-nums;
      }
      .room__bar {
        width: 100%;
        height: 8px;
        background: var(--paper-warm);
        border: 1px solid var(--rule-soft);
        border-radius: 999px;
        overflow: hidden;
      }
      .room__fill {
        height: 100%;
        background: var(--stamp);
        border-radius: 999px;
        transition: width 0.35s ease;
      }
      .room.is-over .room__fill {
        background: #9b1b1b;
      }
      .room__row {
        margin-top: 8px;
        display: flex;
        align-items: baseline;
        gap: 10px;
        flex-wrap: wrap;
      }
      .room__num {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.2rem, 2vw, 1.5rem);
        line-height: 1;
        color: var(--ink);
        letter-spacing: -0.02em;
      }
      .room__cap {
        font-family: var(--font-sans);
        font-size: 12px;
        color: var(--ink-mute);
      }
      .room__alert {
        margin-top: 10px;
        padding: 8px 10px;
        font-family: var(--font-serif);
        font-style: italic;
        font-size: 13px;
        border-radius: 8px;
      }
      .room__alert--warn {
        background: rgba(178, 110, 19, 0.12);
        color: #6f4310;
        border: 1px solid rgba(178, 110, 19, 0.25);
      }
      .room__alert--err {
        background: rgba(155, 27, 27, 0.1);
        color: #7a1414;
        border: 1px solid rgba(155, 27, 27, 0.25);
      }
    `}</style>
  );
}

/** Shared styles for the RRSP callouts panel. */
function RRSPStyles() {
  return (
    <style jsx global>{`
      .rrsp-callouts {
        margin: -2px 0 18px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .rrsp-callouts__grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
      }
      @media (min-width: 640px) {
        .rrsp-callouts__grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      .rrsp-callout {
        padding: 12px 14px;
        background: var(--paper);
        border: 1px solid var(--rule-soft);
        border-left: 3px solid var(--stamp);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .rrsp-callout__lab {
        color: var(--ink-mute);
      }
      .rrsp-callout__val {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.3rem, 2.2vw, 1.6rem);
        line-height: 1.05;
        color: var(--stamp);
        letter-spacing: -0.02em;
        margin-top: 2px;
      }
      .rrsp-callout__val.is-good {
        color: var(--green, #4a7c47);
      }
      .rrsp-callout__val.is-bad {
        color: var(--stamp);
      }
      .rrsp-callout__cap {
        margin-top: 2px;
        font-size: 12px;
      }
      .rrsp-callouts__chip {
        padding: 10px 14px;
        background: rgba(73, 122, 64, 0.08);
        border: 1px solid rgba(73, 122, 64, 0.25);
        border-radius: 8px;
        font-family: var(--font-serif);
        font-style: italic;
        font-size: 13.5px;
        color: var(--ink-soft);
      }
      .rrsp-callouts__chip strong {
        font-style: normal;
        color: var(--green, #4a7c47);
        font-weight: 600;
        font-variant-numeric: tabular-nums lining-nums;
      }
    `}</style>
  );
}

/** Shared styles for the tax-depth strip below the chart. */
function TaxDepthStyles() {
  return (
    <style jsx global>{`
      .tax-depth {
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--rule-soft);
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      @media (min-width: 720px) {
        .tax-depth {
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }
      }
      .tax-depth__cell {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .tax-depth__val {
        font-family: var(--font-display);
        font-weight: 500;
        font-size: clamp(1.4rem, 2.2vw, 1.7rem);
        line-height: 1.05;
        letter-spacing: -0.02em;
        margin-top: 4px;
        color: var(--ink);
        font-variant-numeric: tabular-nums lining-nums;
      }
      .tax-depth__val--green {
        color: var(--green);
      }
      .tax-depth__val--stamp {
        color: var(--stamp);
      }
      .tax-depth__cap {
        font-size: 12px;
        color: var(--ink-mute);
      }
    `}</style>
  );
}
