import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { LONG_TO_SHORT, inferTab } from "@/lib/share-params";
import {
  loadInstrumentFonts,
  PAPER,
  INK,
  SIGNAL,
  GRAY,
  GRAY_700,
} from "@/lib/og/instrument";

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

// ─── Instrument chrome ────────────────────────────────────────
// White page, ink, Archivo, one signal-red accent — the same tokens as
// lib/og/instrument.tsx, imported so the calculator card can never drift
// from the route cards. Only the chrome lives here; every string below is
// still computed from the query params exactly as before.

const GUTTER = 72;
const PAD_Y = 56;
const COLUMN = 1200 - GUTTER * 2; // 1056

const FOOTER_CTA = "RUN YOUR OWN NUMBERS — BUYVEQT.CA/INVEST";

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

/** Masthead: wordmark + live dot micro-label over the 12px ink bar. */
function Masthead() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 1.7,
            color: INK,
          }}
        >
          BUYVEQT
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: SIGNAL,
              marginRight: 11,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: 2.75,
              color: GRAY,
            }}
          >
            THE MATH · VEQT.TO
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          height: 12,
          backgroundColor: INK,
          marginTop: 20,
        }}
      />
    </div>
  );
}

/** Footer: 1px ink rule + the CTA micro-label. */
function Footer() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", height: 1, backgroundColor: INK }} />
      <div
        style={{
          display: "flex",
          fontSize: 12.5,
          fontWeight: 600,
          letterSpacing: 2.25,
          color: GRAY,
          marginTop: 15,
        }}
      >
        {FOOTER_CTA}
      </div>
    </div>
  );
}

function CardShell({ children, badge }: { children: React.ReactNode; badge?: string }) {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: PAPER,
        fontFamily: "Archivo",
        color: INK,
        padding: `${PAD_Y}px ${GUTTER}px`,
      }}
    >
      <Masthead />

      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* The badge is THE red moment on this card — a solid signal chip,
            radius 0, sitting above the question it qualifies. */}
        {badge ? (
          <div style={{ display: "flex", marginBottom: 22 }}>
            <div
              style={{
                display: "flex",
                backgroundColor: SIGNAL,
                padding: "10px 18px 11px",
                borderRadius: 0,
                fontSize: 19,
                fontWeight: 800,
                letterSpacing: 1.2,
                color: PAPER,
              }}
            >
              {badge.toUpperCase()}
            </div>
          </div>
        ) : null}
        {children}
      </div>

      <Footer />
    </div>
  );
}

function Headline({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 34,
        fontWeight: 600,
        letterSpacing: -0.3,
        lineHeight: 1.25,
        color: GRAY_700,
        maxWidth: COLUMN,
      }}
    >
      {text}
    </div>
  );
}

/**
 * The result, set as the card's display line: ink, Archivo 700, tracked in.
 * Steps down for long figures so a nine-figure portfolio can't overflow the
 * 1056px column (0.56em ≈ Archivo Bold's average advance over digits).
 */
function HeroNumber({ text }: { text: string }) {
  const size = Math.max(72, Math.min(120, Math.floor(COLUMN / (text.length * 0.56))));
  return (
    <div
      style={{
        display: "flex",
        fontSize: size,
        fontWeight: 700,
        letterSpacing: Math.round(size * -0.035 * 10) / 10,
        lineHeight: 1,
        color: INK,
        marginTop: 14,
        marginBottom: 18,
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
        display: "flex",
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: 1.4,
        lineHeight: 1.4,
        color: GRAY,
        maxWidth: COLUMN,
      }}
    >
      {text.toUpperCase()}
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

function FIRECard(sp: URLSearchParams) {
  const expenses = p(sp, "expenses");
  const withdrawalRate = p(sp, "withdrawalRate");
  const result = p(sp, "result");
  const coastFire = p(sp, "coastFire");
  const yearsToFire = p(sp, "yearsToFire");
  const yearsNum = Number(yearsToFire) || 0;

  const headline = yearsNum > 0
    ? `FIRE in ~${yearsNum} years with VEQT`
    : "My FIRE plan with VEQT";

  return (
    <CardShell badge="FIRE">
      <Headline text={headline} />
      <HeroNumber text={fmtDollars(result)} />
      <SupportingRow
        text={`${fmtDollars(expenses)}/yr expenses · ${pct(withdrawalRate)} withdrawal rate · ${fmtDollars(coastFire)} Coast FIRE`}
      />
    </CardShell>
  );
}

function FallbackCard() {
  return (
    <CardShell>
      <Headline text="VEQT Investment Calculators" />
      <HeroNumber text="Run your numbers." />
    </CardShell>
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
    case "fire":
      card = FIRECard(sp);
      break;
    default:
      card = FallbackCard();
  }

  const fonts = await loadInstrumentFonts();

  return new ImageResponse(card, { width: 1200, height: 630, fonts });
}
