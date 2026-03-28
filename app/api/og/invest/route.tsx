import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

const GREEN = "#16a34a";
const GRAY = "#6b7280";
const DARK = "#111827";

function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function fmtDate(s: string): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const parts = s.split("-");
  const idx = parseInt(parts[1], 10) - 1;
  return `${months[idx] ?? "Jan"} ${parts[0]}`;
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, padding: "12px 16px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
      <span style={{ fontSize: "22px", fontWeight: 700, color: DARK }}>{value}</span>
      <span style={{ fontSize: "13px", color: GRAY, marginTop: "4px" }}>{label}</span>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", position: "absolute", top: "30px", right: "60px", backgroundColor: GREEN, color: "white", fontSize: "14px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px" }}>
      {text}
    </div>
  );
}

function CardLayout({ headline, heroValue, stats, badge }: {
  headline: string;
  heroValue: string;
  stats: { label: string; value: string }[];
  badge?: string;
}) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#ffffff", padding: "0", position: "relative" }}>
      {/* Green accent bar */}
      <div style={{ display: "flex", width: "100%", height: "6px", backgroundColor: GREEN }} />

      {/* Brand */}
      <div style={{ display: "flex", position: "absolute", top: "30px", left: "60px", fontSize: "20px", fontWeight: 700, color: GRAY }}>
        <span>Buy</span><span style={{ color: GREEN }}>VEQT</span>
      </div>

      {badge && <Badge text={badge} />}

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "80px 60px 60px" }}>
        {/* Headline */}
        <div style={{ display: "flex", fontSize: "24px", color: GRAY, textAlign: "center", marginBottom: "16px" }}>
          {headline}
        </div>

        {/* Hero number */}
        <div style={{ display: "flex", fontSize: "72px", fontWeight: 800, color: GREEN, marginBottom: "32px" }}>
          {heroValue}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", flexDirection: "row", width: "100%", maxWidth: "700px" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, padding: "12px 16px", backgroundColor: "#f9fafb", borderRadius: "8px", marginLeft: i > 0 ? "12px" : "0" }}>
              <span style={{ fontSize: "22px", fontWeight: 700, color: DARK }}>{s.value}</span>
              <span style={{ fontSize: "13px", color: GRAY, marginTop: "4px" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ display: "flex", justifyContent: "center", paddingBottom: "30px", fontSize: "16px", color: GRAY }}>
        Run your own numbers → buyveqt.com/invest
      </div>
    </div>
  );
}

function GenericCard() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", position: "relative" }}>
      <div style={{ display: "flex", width: "100%", height: "6px", backgroundColor: GREEN, position: "absolute", top: 0, left: 0 }} />
      <div style={{ display: "flex", fontSize: "20px", fontWeight: 700, color: GRAY, position: "absolute", top: "30px", left: "60px" }}>
        <span>Buy</span><span style={{ color: GREEN }}>VEQT</span>
      </div>
      <div style={{ display: "flex", fontSize: "48px", fontWeight: 800, color: DARK, marginBottom: "16px" }}>
        VEQT Calculators
      </div>
      <div style={{ display: "flex", fontSize: "22px", color: GRAY, textAlign: "center", maxWidth: "600px" }}>
        Historical returns, DCA planner, dividend income, and TFSA/RRSP growth projector
      </div>
      <div style={{ display: "flex", position: "absolute", bottom: "30px", fontSize: "16px", color: GRAY }}>
        buyveqt.com/invest
      </div>
    </div>
  );
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const tab = p.get("tab");

  // Check if we have result params
  const hasResults = Array.from(p.keys()).some((k) => k.startsWith("r_"));

  if (!tab || !hasResults) {
    return new ImageResponse(<GenericCard />, { width: 1200, height: 630 });
  }

  if (tab === "historical") {
    const mode = p.get("mode") || "lump";
    const amount = Number(p.get("amount")) || 10000;
    const start = p.get("start") || "2019-01";
    const value = Number(p.get("r_value")) || 0;
    const pct = p.get("r_pct") || "0";
    const contributed = Number(p.get("r_contributed")) || amount;

    const headline = mode === "dca"
      ? `If I'd invested ${fmt(amount)}/mo in VEQT since ${fmtDate(start)}...`
      : `If I'd invested ${fmt(amount)} in VEQT in ${fmtDate(start)}...`;

    return new ImageResponse(
      <CardLayout
        headline={headline}
        heroValue={fmt(value)}
        stats={[
          { label: "Contributed", value: fmt(contributed) },
          { label: "Total Return", value: `${Number(pct) >= 0 ? "+" : ""}${pct}%` },
        ]}
      />,
      { width: 1200, height: 630 }
    );
  }

  if (tab === "dca") {
    const monthly = Number(p.get("monthly")) || 500;
    const years = p.get("years") || "20";
    const rate = p.get("rate") || "8";
    const value = Number(p.get("r_value")) || 0;
    const contributed = Number(p.get("r_contributed")) || 0;
    const growth = Number(p.get("r_growth")) || 0;

    return new ImageResponse(
      <CardLayout
        headline={`If I invest ${fmt(monthly)}/mo in VEQT for ${years} years...`}
        heroValue={fmt(value)}
        stats={[
          { label: "Contributed", value: fmt(contributed) },
          { label: "Growth", value: fmt(growth) },
          { label: "Rate Assumed", value: `${rate}%` },
        ]}
      />,
      { width: 1200, height: 630 }
    );
  }

  if (tab === "dividends") {
    const portfolio = Number(p.get("portfolio")) || 100000;
    const yld = p.get("yield") || "1.8";
    const growth = p.get("growth") || "8";
    const annual = Number(p.get("r_annual")) || 0;
    const quarterly = Number(p.get("r_quarterly")) || 0;

    return new ImageResponse(
      <CardLayout
        headline={`My ${fmt(portfolio)} VEQT portfolio could generate...`}
        heroValue={`${fmt(annual)}/year`}
        stats={[
          { label: "Quarterly", value: fmt(quarterly) },
          { label: "Yield", value: `${yld}%` },
          { label: "Growth Assumed", value: `${growth}%` },
        ]}
      />,
      { width: 1200, height: 630 }
    );
  }

  if (tab === "tfsa-rrsp") {
    const account = p.get("account") === "RRSP" ? "RRSP" : "TFSA";
    const starting = Number(p.get("starting")) || 0;
    const annual = Number(p.get("annual")) || 7000;
    const horizon = p.get("horizon") || "25";
    const rate = p.get("return") || "8";
    const value = Number(p.get("r_value")) || 0;

    return new ImageResponse(
      <CardLayout
        headline={`My ${account} with VEQT could grow to...`}
        heroValue={fmt(value)}
        stats={[
          { label: "Starting", value: fmt(starting) },
          { label: "Annual", value: `${fmt(annual)}/yr` },
          { label: `${horizon} yrs at ${rate}%`, value: "Assumed" },
        ]}
        badge={account === "TFSA" ? "Tax-free" : "Tax-deferred"}
      />,
      { width: 1200, height: 630 }
    );
  }

  // Unknown tab fallback
  return new ImageResponse(<GenericCard />, { width: 1200, height: 630 });
}
