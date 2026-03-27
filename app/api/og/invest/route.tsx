import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

// ─── Helpers ──────────────────────────────────────────────────

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function fmtDollars(raw: string | null): string {
  const n = Number(raw);
  if (!raw || isNaN(n)) return "$0";
  return "$" + Math.round(n).toLocaleString("en-US");
}

function fmtDate(raw: string | null): string {
  if (!raw) return "";
  const [y, m] = raw.split("-");
  const mi = parseInt(m, 10);
  if (!y || isNaN(mi) || mi < 1 || mi > 12) return raw;
  return `${MONTHS[mi - 1]} ${y}`;
}

function pct(raw: string | null): string {
  const n = Number(raw);
  if (!raw || isNaN(n)) return "0%";
  return `${n}%`;
}

// ─── Shared layout pieces ─────────────────────────────────────

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        padding: "48px 60px",
        position: "relative",
      }}
    >
      {/* Green accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: "#16a34a",
        }}
      />
      {/* Top-left brand */}
      <div style={{ fontSize: 18, color: "#9ca3af", display: "flex" }}>
        buyveqt.com
      </div>
      {/* Content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 12,
        }}
      >
        {children}
      </div>
      {/* Bottom CTA */}
      <div style={{ fontSize: 16, color: "#9ca3af", display: "flex" }}>
        Run your own numbers → buyveqt.com/invest
      </div>
    </div>
  );
}

function Headline({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: 32,
        fontWeight: 600,
        color: "#374151",
        display: "flex",
      }}
    >
      {text}
    </div>
  );
}

function HeroNumber({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: 72,
        fontWeight: 800,
        color: "#15803d",
        letterSpacing: "-2px",
        display: "flex",
        marginTop: 4,
        marginBottom: 4,
      }}
    >
      {text}
    </div>
  );
}

function SupportingRow({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 22, color: "#6b7280", display: "flex" }}>
      {text}
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        padding: "6px 16px",
        borderRadius: 20,
        border: "2px solid #16a34a",
        color: "#16a34a",
        fontSize: 16,
        fontWeight: 600,
        marginTop: 8,
      }}
    >
      {text}
    </div>
  );
}

// ─── Card renderers per tab ───────────────────────────────────

function HistoricalCard(sp: URLSearchParams) {
  const mode = sp.get("mode");
  const amount = sp.get("amount");
  const start = sp.get("start");
  const result = sp.get("result");
  const returnPct = sp.get("returnPct");
  const contributed = sp.get("contributed");

  const headline =
    mode === "dca"
      ? `If I'd invested ${fmtDollars(amount)}/mo in VEQT since ${fmtDate(start)}...`
      : `If I'd invested ${fmtDollars(amount)} in VEQT in ${fmtDate(start)}...`;

  const supportLine =
    mode === "dca"
      ? `${fmtDollars(contributed)} contributed · +${pct(returnPct)} total return`
      : `${fmtDollars(amount)} invested · +${pct(returnPct)} total return`;

  return (
    <CardShell>
      <Headline text={headline} />
      <HeroNumber text={fmtDollars(result)} />
      <SupportingRow text={supportLine} />
    </CardShell>
  );
}

function DCACard(sp: URLSearchParams) {
  const monthly = sp.get("monthly");
  const horizon = sp.get("horizon");
  const rate = sp.get("rate");
  const result = sp.get("result");
  const contributions = sp.get("contributions");
  const growth = sp.get("growth");

  return (
    <CardShell>
      <Headline
        text={`If I invest ${fmtDollars(monthly)}/mo in VEQT for ${horizon} years...`}
      />
      <HeroNumber text={fmtDollars(result)} />
      <SupportingRow
        text={`${fmtDollars(contributions)} contributions · ${fmtDollars(growth)} projected growth · ${pct(rate)} return assumed`}
      />
    </CardShell>
  );
}

function DividendCard(sp: URLSearchParams) {
  const portfolio = sp.get("portfolio");
  const yieldRate = sp.get("yield");
  const growthRate = sp.get("growthRate");
  const annualIncome = sp.get("annualIncome");
  const annualNum = Number(annualIncome) || 0;
  const quarterly = fmtDollars(String(Math.round(annualNum / 4)));

  return (
    <CardShell>
      <Headline
        text={`My ${fmtDollars(portfolio)} VEQT portfolio could generate...`}
      />
      <HeroNumber text={`${fmtDollars(annualIncome)}/year`} />
      <SupportingRow
        text={`${quarterly}/quarter · ${pct(yieldRate)} yield · ${pct(growthRate)} annual growth assumed`}
      />
    </CardShell>
  );
}

function TFSARRSPCard(sp: URLSearchParams) {
  const account = sp.get("account")?.toUpperCase() || "TFSA";
  const starting = sp.get("starting");
  const annual = sp.get("annual");
  const horizon = sp.get("horizon");
  const rate = sp.get("rate");
  const result = sp.get("result");

  return (
    <CardShell>
      <Headline text={`My ${account} with VEQT could grow to...`} />
      <HeroNumber text={fmtDollars(result)} />
      <SupportingRow
        text={`${fmtDollars(starting)} starting · ${fmtDollars(annual)}/year contributions · ${horizon} years · ${pct(rate)} return assumed`}
      />
      <Badge text={account === "TFSA" ? "Tax-free" : "Tax-deferred"} />
    </CardShell>
  );
}

function FallbackCard() {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111827",
        padding: 60,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: "#16a34a",
        }}
      />
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "-2px",
          display: "flex",
        }}
      >
        <span>Buy</span>
        <span style={{ color: "#16a34a" }}>VEQT</span>
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 400,
          color: "#9ca3af",
          marginTop: 16,
          display: "flex",
        }}
      >
        VEQT Investment Calculators
      </div>
      <div
        style={{
          fontSize: 20,
          color: "#6b7280",
          marginTop: 12,
          display: "flex",
        }}
      >
        Run your numbers at buyveqt.com/invest
      </div>
    </div>
  );
}

// ─── Route handler ────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const tab = sp.get("tab");

  let card: React.ReactNode;

  switch (tab) {
    case "historical":
      card = HistoricalCard(sp);
      break;
    case "dca":
      card = DCACard(sp);
      break;
    case "dividends":
      card = DividendCard(sp);
      break;
    case "tfsa-rrsp":
      card = TFSARRSPCard(sp);
      break;
    default:
      card = FallbackCard();
  }

  return new ImageResponse(card, { width: 1200, height: 630 });
}
