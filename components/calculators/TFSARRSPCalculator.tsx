"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { formatDollars } from "@/lib/chart-utils";
import { CARD } from "@/lib/styles";
import ContributionGrowthChart from "./ContributionGrowthChart";
import { readCalcParams, writeCalcParams } from "@/lib/use-calc-params";
import ShareModal from "@/components/ShareModal";
import { buildShareUrl, buildOgImageUrl, formatShareDollars, type ShareParams } from "@/lib/share-utils";
import { tfsaRrspShareSnippet } from "@/lib/social-snippets";

export default function TFSARRSPCalculator() {
  const urlParams = readCalcParams(
    ["account", "starting", "annual", "horizon", "return"],
    { account: "TFSA", starting: "0", annual: "7000", horizon: "25", return: "8" }
  );

  const [accountType, setAccountType] = useState<"TFSA" | "RRSP">(
    urlParams.account === "RRSP" ? "RRSP" : "TFSA"
  );
  const [startingBalance, setStartingBalance] = useState(() => {
    const n = Number(urlParams.starting);
    return !isNaN(n) && n >= 0 && n <= 500000 ? n : 0;
  });
  const [annualContribution, setAnnualContribution] = useState(() => {
    const n = Number(urlParams.annual);
    return !isNaN(n) && n >= 0 && n <= 50000 ? n : 7000;
  });
  const [years, setYears] = useState(() => {
    const n = Number(urlParams.horizon);
    return !isNaN(n) && n >= 1 && n <= 40 ? n : 25;
  });
  const [returnRate, setReturnRate] = useState(() => {
    const n = Number(urlParams.return);
    return !isNaN(n) && n >= 1 && n <= 15 ? n : 8;
  });

  const tfsaInitialized = useRef(false);
  useEffect(() => {
    if (!tfsaInitialized.current) { tfsaInitialized.current = true; return; }
    writeCalcParams({
      account: accountType,
      starting: startingBalance.toString(),
      annual: annualContribution.toString(),
      horizon: years.toString(),
      return: returnRate.toString(),
    });
  }, [accountType, startingBalance, annualContribution, years, returnRate]);

  const [shareOpen, setShareOpen] = useState(false);

  const { totalContributions, portfolioValue, totalGrowth, chartData } =
    useMemo(() => {
      const rate = returnRate / 100;
      const totalContributions = startingBalance + annualContribution * years;

      const points: {
        year: number;
        contributions: number;
        growth: number;
        total: number;
      }[] = [
        {
          year: 0,
          contributions: startingBalance,
          growth: 0,
          total: startingBalance,
        },
      ];

      let balance = startingBalance;
      for (let y = 1; y <= years; y++) {
        balance = (balance + annualContribution) * (1 + rate);
        const contrib = startingBalance + annualContribution * y;
        points.push({
          year: y,
          contributions: contrib,
          growth: balance - contrib,
          total: balance,
        });
      }

      return {
        totalContributions,
        portfolioValue: balance,
        totalGrowth: balance - totalContributions,
        chartData: points,
      };
    }, [startingBalance, annualContribution, years, returnRate]);

  return (
    <div className={CARD}>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
        TFSA / RRSP Growth Projector
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Project how VEQT could grow inside your registered account over time.
      </p>

      {/* Account type toggle */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
          Account Type
        </label>
        <div className="flex gap-0.5 rounded-lg bg-[var(--color-base)] p-0.5 w-fit">
          {(["TFSA", "RRSP"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAccountType(type)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                accountType === type
                  ? "bg-white text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Starting Balance
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
              $
            </span>
            <input
              type="number"
              value={startingBalance}
              onChange={(e) => {
                const v = Math.max(0, Math.min(500000, Number(e.target.value) || 0));
                setStartingBalance(v);
              }}
              onBlur={() =>
                setStartingBalance(Math.round(startingBalance / 1000) * 1000)
              }
              min={0}
              max={500000}
              step={1000}
              className="w-full rounded-md border border-[var(--color-border)] bg-white py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Annual Contribution
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
              $
            </span>
            <input
              type="number"
              value={annualContribution}
              onChange={(e) => {
                const v = Math.max(0, Math.min(50000, Number(e.target.value) || 0));
                setAnnualContribution(v);
              }}
              onBlur={() =>
                setAnnualContribution(
                  Math.round(annualContribution / 500) * 500
                )
              }
              min={0}
              max={50000}
              step={500}
              className="w-full rounded-md border border-[var(--color-border)] bg-white py-2 pl-7 pr-3 text-sm font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Time Horizon: {years} years
          </label>
          <input
            type="range"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            min={1}
            max={40}
            step={1}
            className="calc-slider w-full mt-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
            <span>1 yr</span>
            <span>40 yrs</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Annual Return: {returnRate.toFixed(1)}%
          </label>
          <input
            type="range"
            value={returnRate}
            onChange={(e) => setReturnRate(Number(e.target.value))}
            min={1}
            max={15}
            step={0.5}
            className="calc-slider w-full mt-2"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
            <span>1%</span>
            <span>15%</span>
          </div>
        </div>
      </div>

      <ContributionGrowthChart
        chartData={chartData}
        stats={[
          { label: "Total Contributions", value: totalContributions },
          { label: "Est. Portfolio Value", value: portfolioValue },
          { label: "Total Growth", value: totalGrowth, highlight: true },
        ]}
      />

      {/* Share button */}
      <button
        onClick={() => setShareOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-4"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share Results
      </button>

      {(() => {
        const shareParams: ShareParams = {
          tab: "tfsa-rrsp",
          account: accountType,
          starting: startingBalance.toString(),
          annual: annualContribution.toString(),
          horizon: years.toString(),
          return: returnRate.toString(),
          r_value: Math.round(portfolioValue).toString(),
          r_contributions: Math.round(totalContributions).toString(),
          r_growth: Math.round(totalGrowth).toString(),
        };
        return (
          <ShareModal
            isOpen={shareOpen}
            onClose={() => setShareOpen(false)}
            shareUrl={buildShareUrl(shareParams)}
            snippet={tfsaRrspShareSnippet({
              account: accountType, annual: annualContribution,
              years, value: portfolioValue, url: buildShareUrl(shareParams),
            })}
            ogImageUrl={buildOgImageUrl(shareParams)}
            headline={`${accountType} with VEQT could grow to`}
            heroValue={formatShareDollars(portfolioValue)}
          />
        );
      })()}

      {/* Account type info box */}
      <div className="rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] p-4 mb-6">
        <p className="text-xs font-medium text-[var(--color-brand)] uppercase tracking-wider mb-1.5">
          {accountType} Details
        </p>
        {accountType === "TFSA" ? (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            In a TFSA, all investment growth is completely tax-free. You
            won&apos;t pay any tax when you withdraw funds. The current annual
            TFSA contribution limit is $7,000 (2025). Unused room accumulates
            and carries forward.
          </p>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            In an RRSP, contributions are tax-deductible — they reduce your
            taxable income in the year you contribute. Your investments grow
            tax-deferred. However, all withdrawals in retirement are taxed as
            regular income. The annual RRSP contribution limit is 18% of your
            previous year&apos;s earned income, up to a maximum (currently
            ~$32,490 for 2025).
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="text-[11px] text-[var(--color-text-muted)] space-y-1.5 border-t border-[var(--color-border)] pt-4">
        <p>
          This uses a simplified fixed annual return. Actual investment returns
          vary significantly year to year.
        </p>
        <p>
          TFSA and RRSP contribution limits change annually and depend on your
          individual situation. Check the CRA website for current limits.
        </p>
        <p>
          This calculator does not model taxes, inflation, fees, or employer
          matching (for group RRSPs).
        </p>
        <p>
          The RRSP projection does not estimate the tax owed on withdrawal, which
          depends on your retirement income and province of residence.
        </p>
      </div>
    </div>
  );
}
