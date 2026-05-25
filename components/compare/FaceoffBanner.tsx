"use client";

import { useState, useEffect } from "react";
import { FUNDS } from "@/data/funds";
import { fundColor } from "@/lib/styles";

interface FundQuoteData {
  price: number | null;
  changePercent: number | null;
}

interface FaceoffBannerProps {
  selected: string[];
}

function FaceoffSide({
  ticker,
  quote,
}: {
  ticker: string;
  quote: FundQuoteData | null;
}) {
  const fund = FUNDS[ticker];
  if (!fund) return null;

  const isVeqt = ticker === "VEQT.TO";
  const color = fundColor(fund.shortName);
  const price = quote?.price ?? null;
  const changePct = quote?.changePercent ?? null;
  const up = changePct !== null ? changePct >= 0 : true;

  return (
    <article className="fside">
      <div className="fside__stripe" style={{ background: color }} aria-hidden />
      <header className="fside__head">
        <div className="ed-stamp fside__eyebrow">
          {isVeqt ? "Slot 1 · House" : "Challenger"}
        </div>
        <h3 className="ed-display fside__ticker">{fund.shortName}</h3>
        <p className="ed-caption fside__name">{fund.name}</p>
      </header>
      <div className="fside__price">
        <span className="ed-display ed-numerals fside__price-val">
          {price != null ? `$${price.toFixed(2)}` : "—"}
        </span>
        {changePct !== null && (
          <span
            className="ed-numerals fside__price-pct"
            style={{ color: up ? "var(--green)" : "var(--stamp)" }}
          >
            {up ? "↑ +" : "↓ −"}
            {Math.abs(changePct).toFixed(2)}%
          </span>
        )}
      </div>
      <dl className="fside__stats">
        <div>
          <dt>MER</dt>
          <dd className="ed-numerals">{fund.mer.toFixed(2)}%</dd>
        </div>
        <div>
          <dt>AUM</dt>
          <dd className="ed-numerals">{fund.aum}</dd>
        </div>
        <div>
          <dt>Holdings</dt>
          <dd className="ed-numerals">
            {fund.numberOfHoldings.toLocaleString("en-CA")}
          </dd>
        </div>
        <div>
          <dt>Equity/FI</dt>
          <dd className="ed-numerals">
            {fund.equityAllocation}/{fund.fixedIncomeAllocation}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export default function FaceoffBanner({ selected }: FaceoffBannerProps) {
  const [quotes, setQuotes] = useState<Record<string, FundQuoteData>>({});

  useEffect(() => {
    if (selected.length !== 2) return;
    fetch(`/api/funds/compare?tickers=${selected.join(",")}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json?.data) return;
        const q: Record<string, FundQuoteData> = {};
        for (const [k, v] of Object.entries(
          json.data as Record<string, FundQuoteData>
        )) {
          q[k] = { price: v.price, changePercent: v.changePercent };
        }
        setQuotes(q);
      })
      .catch(() => {});
  }, [selected]);

  if (selected.length !== 2) return null;

  const tickerA = selected[0];
  const tickerB = selected[1];
  const fundA = FUNDS[tickerA];
  const fundB = FUNDS[tickerB];
  if (!fundA || !fundB) return null;

  const pctA = quotes[tickerA]?.changePercent ?? null;
  const pctB = quotes[tickerB]?.changePercent ?? null;
  const todayDelta =
    pctA !== null && pctB !== null ? pctA - pctB : null;
  const sign = (n: number) => (n >= 0 ? "+" : "−");

  return (
    <section
      className="faceoff"
      aria-label={`${fundA.shortName} vs ${fundB.shortName} face-off`}
    >
      <div className="faceoff__side faceoff__side--a">
        <FaceoffSide ticker={tickerA} quote={quotes[tickerA] ?? null} />
      </div>

      <div className="faceoff__vs">
        <span className="ed-display-italic faceoff__vs-text">vs.</span>
        <div className="faceoff__delta">
          <span className="ed-label">Today&apos;s spread</span>
          {todayDelta !== null ? (
            <>
              <span
                className="ed-numerals faceoff__delta-val"
                style={{
                  color:
                    todayDelta >= 0 ? "var(--green)" : "var(--stamp)",
                }}
              >
                {sign(todayDelta)}
                {Math.abs(todayDelta).toFixed(2)} pp
              </span>
              <span className="ed-caption faceoff__delta-cap">
                {todayDelta >= 0
                  ? `${fundA.shortName} leads`
                  : `${fundB.shortName} leads`}
              </span>
            </>
          ) : (
            <span className="ed-caption faceoff__delta-cap">Loading…</span>
          )}
        </div>
      </div>

      <div className="faceoff__side faceoff__side--b">
        <FaceoffSide ticker={tickerB} quote={quotes[tickerB] ?? null} />
      </div>

      <style jsx>{`
        .faceoff {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 16px;
          align-items: stretch;
          padding: 24px 22px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-radius: 16px;
        }
        @media (max-width: 720px) {
          .faceoff {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 20px 18px;
          }
        }
        .faceoff__vs {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 6px;
          gap: 16px;
          border-left: 1px solid var(--rule-soft);
          border-right: 1px solid var(--rule-soft);
        }
        @media (max-width: 720px) {
          .faceoff__vs {
            border-left: none;
            border-right: none;
            border-top: 1px solid var(--rule-soft);
            border-bottom: 1px solid var(--rule-soft);
            padding: 14px 0;
          }
        }
        .faceoff__vs-text {
          font-size: clamp(2rem, 4vw, 3rem);
          line-height: 1;
          color: var(--ink-faint);
          letter-spacing: -0.02em;
        }
        .faceoff__delta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .faceoff__delta-val {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(1.2rem, 1.8vw, 1.5rem);
          line-height: 1;
          letter-spacing: -0.015em;
          white-space: nowrap;
        }
        .faceoff__delta-cap {
          font-size: 11px;
          white-space: nowrap;
        }

        /* FaceoffSide — scoped via :global since it renders as child article */
        :global(.fside) {
          position: relative;
          padding: 0 0 0 14px;
          min-width: 0;
        }
        :global(.fside__stripe) {
          position: absolute;
          left: 0;
          top: 4px;
          bottom: 4px;
          width: 4px;
          border-radius: 2px;
        }
        :global(.fside__eyebrow) {
          opacity: 0.7;
        }
        :global(.fside__ticker) {
          font-size: clamp(2.4rem, 4.6vw, 3.6rem);
          line-height: 1;
          margin: 6px 0 4px;
          color: var(--ink);
          letter-spacing: -0.035em;
        }
        :global(.fside__name) {
          font-size: 12.5px;
          margin: 0;
          max-width: 40ch;
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--ink-mute);
        }
        :global(.fside__price) {
          margin-top: 14px;
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        :global(.fside__price-val) {
          font-size: clamp(1.6rem, 2.8vw, 2rem);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        :global(.fside__price-pct) {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
        }
        :global(.fside__stats) {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin: 16px 0 0;
        }
        :global(.fside__stats > div) {
          padding: 8px 10px;
          background: var(--paper-warm);
          border-radius: 8px;
          min-width: 0;
        }
        :global(.fside__stats dt) {
          font-family: var(--font-sans);
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-mute);
        }
        :global(.fside__stats dd) {
          margin: 4px 0 0;
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 16px;
          line-height: 1;
          color: var(--ink);
        }
        @media (max-width: 480px) {
          :global(.fside__stats) {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </section>
  );
}
