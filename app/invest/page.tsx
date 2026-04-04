import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import CalculatorTabs from "@/components/invest/CalculatorTabs";
import { getDailyHistory } from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl, SITE_NAME, SITE_URL } from "@/lib/seo-config";
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
  // Expand short param keys (t→tab, r→result, etc.) so both short and long URLs work
  const sp = expandParams(await searchParams);
  const tab = typeof sp.tab === "string" ? sp.tab : null;
  const hasResult =
    typeof sp.result === "string" ||
    typeof sp.annualIncome === "string";

  if (!tab || !hasResult) {
    return {
      title: "VEQT Calculators — Historical Returns, DCA, Dividends & TFSA/RRSP",
      description:
        "Free VEQT investment calculators. See what your investment would be worth today, plan DCA contributions, estimate dividend income, and project TFSA/RRSP growth.",
      alternates: { canonical: canonicalUrl("/invest") },
      openGraph: {
        title: "VEQT Investment Calculators",
        description:
          "Historical return calculator, DCA planner, dividend income estimator, and TFSA/RRSP growth projector for VEQT investors.",
        url: canonicalUrl("/invest"),
      },
    };
  }

  // Build the OG image URL forwarding all params
  const ogParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") ogParams.set(k, v);
  }
  const ogImageUrl = `${SITE_URL}/api/og/invest?${ogParams.toString()}`;

  // Build URL with params for canonical
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
    // Will show DataUnavailable in the component
  }

  return (
    <PageShell>
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
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            VEQT Calculators
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-prose">
            Four tools to help you plan, visualize, and understand your VEQT
            investment.
          </p>
        </div>

        <CalculatorTabs history={historyResult} />

        <p className="text-[11px] text-[var(--color-text-muted)] mt-8 max-w-prose">
          These calculators use simplified assumptions for illustration purposes.
          They do not account for all fees, taxes, inflation, or market
          volatility. Past performance does not guarantee future results. Not
          financial advice.
        </p>
      </main>
    </PageShell>
  );
}
