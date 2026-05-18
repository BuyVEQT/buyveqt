import type { Metadata } from "next";
import CalculatorTabs from "@/components/invest/CalculatorTabs";
import CalculatorsHero from "@/components/invest/CalculatorsHero";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";
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
      title: "The Math — VEQT Calculators",
      description:
        "Five calculators on the boring fund: lookback, drip, yield, shelter, exit. Free VEQT calculators for Canadian investors.",
      alternates: { canonical: canonicalUrl("/calculators") },
      openGraph: {
        title: "The Math — VEQT Calculators",
        description:
          "Lookback, drip, yield, shelter, exit. Five calculators on Vanguard's boring all-equity fund.",
        url: canonicalUrl("/calculators"),
      },
    };
  }

  const ogParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") ogParams.set(k, v);
  }
  const ogImageUrl = `${SITE_URL}/api/og/invest?${ogParams.toString()}`;
  const pageUrl = `${SITE_URL}/calculators?${ogParams.toString()}`;

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
    alternates: { canonical: canonicalUrl("/calculators") },
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

export default async function CalculatorsPage() {
  let historyResult = null;
  try {
    historyResult = await getDailyHistory("VEQT", "full");
  } catch {
    // Will show DataUnavailable in the calculator component
  }

  // Compute volatility stats server-side (once per 24h ISR cycle)
  const volatilityStats = computeVolatilityStats(historyResult);

  return (
    <main
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        minHeight: "100dvh",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "20px 14px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <JsonLd
          data={buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Calculators", path: "/calculators" },
          ])}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "VEQT Investment Calculators",
            description:
              "Historical return calculator, DCA planner, dividend income estimator, and TFSA/RRSP growth projector.",
            url: canonicalUrl("/calculators"),
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

        <CalculatorsHero />

        <section aria-labelledby="calculators-heading">
          <h2 id="calculators-heading" className="sr-only">
            Calculators
          </h2>
          <CalculatorTabs
            history={historyResult}
            volatilityStats={volatilityStats}
          />
        </section>

        <Card>
          <SectionLabel>The fine print</SectionLabel>
          <div
            className="ed-body"
            style={{
              marginTop: 14,
              fontSize: 15,
              lineHeight: 1.65,
              color: "var(--ink-soft)",
              maxWidth: "64ch",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <p style={{ margin: 0 }}>
              These calculators use simplified assumptions for illustration.
              They don&apos;t account for fees, taxes, inflation, or the
              full shape of market volatility — only the bones of the math.
            </p>
            <p style={{ margin: 0 }}>
              <em>Past performance is not a forecast.</em> The Lookback tells
              you what was; the other four ask you to assume a future return
              rate. Reasonable assumptions still produce wide ranges —
              change a 7% input to 5% and watch what happens.
            </p>
            <p style={{ margin: 0 }}>
              None of this is financial advice. It&apos;s arithmetic, run
              slowly, on one ETF. Your situation, taxes, and risk tolerance
              are your own to weigh.
            </p>
          </div>
          <p
            className="ed-label"
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: "1px solid var(--rule-soft)",
              fontStyle: "italic",
              fontFamily: "var(--font-serif)",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "none",
              color: "var(--ink-mute)",
            }}
          >
            Source: VEQT historical price data via Yahoo Finance · Updated daily
          </p>
        </Card>
      </div>
    </main>
  );
}
