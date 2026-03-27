import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { LONG_TO_SHORT, inferTab } from "@/lib/share-params";

export const runtime = "edge";

/** Read a param by its long name, falling back to the short alias */
function p(sp: URLSearchParams, longKey: string): string | null {
  const shortKey = LONG_TO_SHORT[longKey];
  return sp.get(longKey) || (shortKey ? sp.get(shortKey) : null);
}

/** Convert URLSearchParams to a plain record for inferTab */
function spToRecord(sp: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  sp.forEach((v, k) => { out[k] = v; });
  return out;
}

// ─── Brand colors ─────────────────────────────────────────────

const RED = "#c8102e";
const RED_DARK = "#a50d26";
const WHITE = "#ffffff";
const WHITE_80 = "rgba(255,255,255,0.80)";
const WHITE_50 = "rgba(255,255,255,0.50)";
const GREEN = "#16a34a";

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

// ─── Shared layout ────────────────────────────────────────────

function CardShell({ children, badge }: { children: React.ReactNode; badge?: string }) {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        backgroundColor: RED,
        padding: "0",
        position: "relative",
      }}
    >
      {/* Subtle darker gradient strip at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: `linear-gradient(to bottom, transparent, ${RED_DARK})`,
        }}
      />

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 72px",
          gap: 8,
        }}
      >
        {children}
      </div>

      {/* Bottom bar: CTA left, BuyVEQT logo right */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 72px 40px 72px",
        }}
      >
        <div style={{ fontSize: 22, color: WHITE_50, display: "flex" }}>
          Run your own numbers → buyveqt.com/invest
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: WHITE,
              letterSpacing: "-1px",
              display: "flex",
            }}
          >
            <span>Buy</span>
            <span style={{ color: GREEN }}>VEQT</span>
          </div>
        </div>
      </div>

      {/* Optional badge */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 72,
            display: "flex",
            padding: "8px 20px",
            borderRadius: 24,
            backgroundColor: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.3)",
            color: WHITE,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.5px",
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}

function Headline({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: 38,
        fontWeight: 600,
        color: WHITE_80,
        display: "flex",
        lineHeight: 1.2,
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
        fontSize: 96,
        fontWeight: 800,
        color: WHITE,
        letterSpacing: "-3px",
        display: "flex",
        marginTop: 8,
        marginBottom: 8,
        lineHeight: 1,
      }}
    >
      {text}
    </div>
  );
}

function SupportingRow({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: 26,
        color: WHITE_80,
        display: "flex",
        letterSpacing: "0.3px",
      }}
    >
      {text}
    </div>
  );
}

// ─── Card renderers per tab ───────────────────────────────────

function HistoricalCard(sp: URLSearchParams) {
  const mode = p(sp, "mode");
  const amount = p(sp, "amount");
  const start = p(sp, "start");
  const result = p(sp, "result");
  const returnPct = p(sp, "returnPct");
  const contributed = p(sp, "contributed");

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
  const monthly = p(sp, "monthly");
  const horizon = p(sp, "horizon");
  const rate = p(sp, "rate");
  const result = p(sp, "result");
  const contributions = p(sp, "contributions");
  const growth = p(sp, "growth");

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
  const portfolio = p(sp, "portfolio");
  const yieldRate = p(sp, "yield");
  const growthRate = p(sp, "growthRate");
  const annualIncome = p(sp, "annualIncome");
  const annualNum = Number(annualIncome) || 0;
  const quarterly = fmtDollars(String(Math.round(annualNum / 4)));

  return (
    <CardShell>
      <Headline
        text={`My ${fmtDollars(portfolio)} VEQT portfolio could generate...`}
      />
      <HeroNumber text={`${fmtDollars(annualIncome)}/yr`} />
      <SupportingRow
        text={`${quarterly}/quarter · ${pct(yieldRate)} yield · ${pct(growthRate)} annual growth assumed`}
      />
    </CardShell>
  );
}

function TFSARRSPCard(sp: URLSearchParams) {
  const account = p(sp, "account")?.toUpperCase() || "TFSA";
  const starting = p(sp, "starting");
  const annual = p(sp, "annual");
  const horizon = p(sp, "horizon");
  const rate = p(sp, "rate");
  const result = p(sp, "result");

  return (
    <CardShell badge={account === "TFSA" ? "Tax-free" : "Tax-deferred"}>
      <Headline text={`My ${account} with VEQT could grow to...`} />
      <HeroNumber text={fmtDollars(result)} />
      <SupportingRow
        text={`${fmtDollars(starting)} starting · ${fmtDollars(annual)}/yr contributions · ${horizon} years · ${pct(rate)} return assumed`}
      />
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
        backgroundColor: RED,
        padding: 60,
        position: "relative",
      }}
    >
      {/* Darker bottom gradient */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: `linear-gradient(to bottom, transparent, ${RED_DARK})`,
        }}
      />
      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: WHITE,
          letterSpacing: "-3px",
          display: "flex",
        }}
      >
        <span>Buy</span>
        <span style={{ color: GREEN }}>VEQT</span>
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 500,
          color: WHITE_80,
          marginTop: 20,
          display: "flex",
        }}
      >
        VEQT Investment Calculators
      </div>
      <div
        style={{
          fontSize: 22,
          color: WHITE_50,
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
  const tab = inferTab(spToRecord(sp));

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
