import type { Metadata } from "next";
import CalcMasthead from "@/components/calculators/CalcMasthead";
import FinePrint from "@/components/calculators/FinePrint";
import CalculatorsClient from "@/components/calculators/CalculatorsClient";
import { getDailyHistory } from "@/lib/data";
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
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
        "Four calculators on the boring fund: lookback, DCA, TFSA/RRSP, FIRE. Free VEQT calculators for Canadian investors.",
      alternates: { canonical: canonicalUrl("/calculators") },
      openGraph: {
        title: "The Math — VEQT Calculators",
        description:
          "Lookback, DCA, shelter, exit. Four calculators on Vanguard's boring all-equity fund.",
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
    // Lookback renders a quiet placeholder if history is null.
  }

  const sessionsCount = historyResult?.data?.length ?? 0;

  return (
    <main
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        minHeight: "100dvh",
      }}
    >
      <div className="calc-stack">
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
              "Historical return calculator, DCA planner, TFSA/RRSP growth projector, and FIRE planner for VEQT investors.",
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

        <CalcMasthead sessionsCount={sessionsCount} />
        <CalculatorsClient history={historyResult} />
        <FinePrint />
      </div>

      <style>{`
        .calc-stack {
          /* Calculators are dashboards, not articles — give them the
             screen. Wider container lets the charts fill the page and
             keeps the controls comfortable side-by-side. */
          max-width: min(1600px, calc(100% - 48px));
          margin: 0 auto;
          padding: 8px 0 60px;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 720px) {
          .calc-stack {
            max-width: 100%;
            padding: 4px 18px 60px;
          }
        }
      `}</style>
    </main>
  );
}
