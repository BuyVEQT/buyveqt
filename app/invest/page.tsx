import type { Metadata } from "next";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import CalculatorTabs from "@/components/invest/CalculatorTabs";
import StandingFeature from "@/components/invest/StandingFeature";
import SeverityMeterAuto from "@/components/broadsheet/SeverityMeterAuto";
import { getDailyHistory } from "@/lib/data";
import { computeVolatilityStats } from "@/lib/data/volatility";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildBreadcrumbSchema,
  canonicalUrl,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo-config";
import { expandParams } from "@/lib/share-params";

export const revalidate = 86400; // 24 hours

// ─── Helpers for dynamic OG titles ────────────────────────────

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function fmtDollars(raw: string): string {
  const n = Number(raw);
  if (isNaN(n)) return "$0";
  return "$" + Math.round(n).toLocaleString("en-US");
}

function fmtDate(raw: string): string {
  const [y, m] = raw.split("-");
  const mi = parseInt(m, 10);
  if (!y || isNaN(mi) || mi < 1 || mi > 12) return raw;
  return `${MONTHS[mi - 1]} ${y}`;
}

// ─── Dynamic metadata ─────────────────────────────────────────

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = expandParams(await searchParams);
  const tab = typeof sp.tab === "string" ? sp.tab : null;
  const hasResult =
    typeof sp.result === "string" ||
    typeof sp.annualIncome === "string";

  if (!tab || !hasResult) {
    return {
      title: "The Reckoner — VEQT Calculators",
      description:
        "Five reckonings on the boring fund: lookback, drip, yield, shelter, exit. Free VEQT calculators for Canadian investors.",
      alternates: { canonical: canonicalUrl("/invest") },
      openGraph: {
        title: "The Reckoner — VEQT Calculators",
        description:
          "Lookback, drip, yield, shelter, exit. Five reckonings on Vanguard's boring all-equity fund.",
        url: canonicalUrl("/invest"),
      },
    };
  }

  const ogParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") ogParams.set(k, v);
  }
  const ogImageUrl = `${SITE_URL}/api/og/invest?${ogParams.toString()}`;
  const pageUrl = `${SITE_URL}/invest?${ogParams.toString()}`;

  let title = "VEQT Calculator Results";
  let description = "See my VEQT investment calculator results at buyveqt.ca";

  const g = (key: string) => (typeof sp[key] === "string" ? sp[key] as string : "");

  switch (tab) {
    case "historical": {
      const mode = g("mode");
      const amount = fmtDollars(g("amount"));
      const start = fmtDate(g("start"));
      const result = fmtDollars(g("result"));
      title =
        mode === "dca"
          ? `${amount}/mo in VEQT since ${start} → ${result}`
          : `${amount} in VEQT since ${start} → ${result}`;
      description = `${fmtDollars(g("contributed") || g("amount"))} contributed · +${g("returnPct")}% total return`;
      break;
    }
    case "dca": {
      title = `${fmtDollars(g("monthly"))}/mo in VEQT for ${g("horizon")} years → ${fmtDollars(g("result"))}`;
      description = `${fmtDollars(g("contributions"))} contributions · ${fmtDollars(g("growth"))} projected growth · ${g("rate")}% return assumed`;
      break;
    }
    case "dividends": {
      title = `${fmtDollars(g("portfolio"))} VEQT portfolio → ${fmtDollars(g("annualIncome"))}/year in dividends`;
      description = `${g("yield")}% yield · ${g("growthRate")}% annual growth assumed`;
      break;
    }
    case "tfsa-rrsp": {
      const account = (g("account") || "TFSA").toUpperCase();
      title = `My ${account} with VEQT → ${fmtDollars(g("result"))}`;
      description = `${fmtDollars(g("starting"))} starting · ${fmtDollars(g("annual"))}/year · ${g("horizon")} years · ${g("rate")}% return`;
      break;
    }
    case "fire": {
      const years = g("yearsToFire");
      const target = fmtDollars(g("result"));
      title = years ? `FIRE in ${years} years — ${target} target` : `My FIRE plan with VEQT → ${target}`;
      description = `${fmtDollars(g("expenses"))}/yr expenses · ${g("withdrawalRate")}% withdrawal rate · ${fmtDollars(g("coastFire"))} Coast FIRE number`;
      break;
    }
  }

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl("/invest") },
    openGraph: {
      title,
      description,
      url: pageUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function InvestPage() {
  let historyResult = null;
  try {
    historyResult = await getDailyHistory("VEQT", "full");
  } catch {
    // Will show DataUnavailable in the calculator component
  }

  // Compute volatility stats server-side (once per 24h ISR cycle)
  const volatilityStats = computeVolatilityStats(historyResult);

  return (
    <InteriorShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Calculators", path: "/invest" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "VEQT Investment Calculators",
          description:
            "Historical return calculator, DCA planner, dividend income estimator, and TFSA/RRSP growth projector.",
          url: canonicalUrl("/invest"),
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "CAD",
          },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
          },
        }}
      />

      {/* SECTION: Page head ─────────────────────────────────────── */}
      <section className="pt-8 sm:pt-10 pb-2 bs-enter">
        <p className="bs-stamp mb-3">The Reckoner</p>
        <h1
          className="bs-display text-[1.875rem] sm:text-[2.25rem] leading-[1.1]"
          style={{ color: "var(--ink)" }}
        >
          Run the figures, <em className="bs-display-italic">slowly.</em>
        </h1>
        <p
          className="bs-body italic mt-5 max-w-[58ch] text-[1.0625rem]"
          style={{ color: "var(--ink-soft)" }}
        >
          Five reckonings on the boring fund — what it would have been,
          what it might be, what it pays, what it shelters, and how soon
          it could buy you out.
        </p>
      </section>

      {/* SECTION: The Standing — feature lookback stat ─────────── */}
      <StandingFeature history={historyResult} />

      {/* SECTION: The Questions — tab selector + active calc ───── */}
      <section
        className="mt-10 sm:mt-14 pt-6 border-t-2 border-[var(--ink)]"
        aria-labelledby="questions-heading"
      >
        <p id="questions-heading" className="bs-stamp mb-3">
          The Questions
        </p>
        <h2
          className="bs-display text-[1.5rem] sm:text-[2rem] mb-5"
          style={{ color: "var(--ink)" }}
        >
          <em>Pick the question</em> you came here to ask
        </h2>

        {/* Severity strip — anchors today's reading right above the
            calculators so a panicked reader sees their context first. */}
        <div className="mb-6">
          <SeverityMeterAuto compact />
        </div>

        <CalculatorTabs
          history={historyResult}
          volatilityStats={volatilityStats}
        />
      </section>

      {/* SECTION: Fine print ─────────────────────────────────────── */}
      <section
        className="mt-10 sm:mt-14 pt-6 border-t-2 border-[var(--ink)]"
        aria-labelledby="invest-fineprint-heading"
      >
        <p id="invest-fineprint-heading" className="bs-stamp mb-3">
          The Fine Print
        </p>
        <h2
          className="bs-display text-[1.5rem] sm:text-[2rem] mb-5"
          style={{ color: "var(--ink)" }}
        >
          <em>What these are,</em> and what they aren&apos;t
        </h2>

        <div
          className="bs-body text-[15px] leading-[1.65] space-y-4 max-w-[62ch]"
          style={{ color: "var(--ink)" }}
        >
          <p>
            These reckoners use simplified assumptions for illustration.
            They don&apos;t account for fees, taxes, inflation, or the
            full shape of market volatility — only the bones of the math.
          </p>
          <p>
            <em>Past performance is not a forecast.</em> The Lookback
            tells you what was; the other four ask you to assume a future
            return rate. Reasonable assumptions still produce wide
            ranges — change a 7% input to 5% and watch what happens.
          </p>
          <p>
            None of this is financial advice. It&apos;s arithmetic, run
            slowly, on one ETF. Your situation, taxes, and risk tolerance
            are your own to weigh.
          </p>
        </div>

        <p
          className="bs-caption italic mt-6 pt-4 border-t border-[var(--color-border)] text-[11px]"
          style={{ color: "var(--ink-soft)" }}
        >
          Source: VEQT historical price data via Yahoo Finance · Updated
          daily
        </p>
      </section>
    </InteriorShell>
  );
}
