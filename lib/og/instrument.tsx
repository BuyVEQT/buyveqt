import { ImageResponse } from "next/og";
import { loadGoogleFont } from "./load-font";

/**
 * "Instrument" Open Graph card — the social-card twin of the home redesign.
 *
 * Design language (Swiss instrument panel, per the v2 handoff):
 *   - White page (#ffffff), ink (#111111), and ONE signal-red accent
 *   - Archivo grotesk only — emphasis is weight + red, never slant
 *   - Radius 0, no shadows, no gradients, everything uppercase except the
 *     display line and the dek
 *   - The site's signature 6px masthead bar, scaled to 12px for the card
 *
 * Tokens mirror `--ins-*` in app/globals.css so the card and the page can
 * never drift.
 *
 * ── The grammar every route composes from ──────────────────────────────
 *   eyebrow   gray kicker — the section marker ("HEAD TO HEAD")
 *   title     the display line, 1–3 lines, auto-sized to the column
 *   dek       one supporting sentence in gray-700 (or `stats`, not both)
 *   chip      THE red moment — the route's headline fact or section
 *   statLabel gray micro-label beside the chip
 *   stats     optional label/value facts row, in the hero's facts grammar
 *   footer    1px ink rule + micro-label
 */

/** One column of the facts row — mirrors `.ihero__fact` on the home hero. */
export interface InstrumentStat {
  /** Tiny uppercase gray label, e.g. "COUNTRIES". */
  label: string;
  /** Ink value under the label, e.g. "50". */
  value: string;
}

export interface InstrumentOGProps {
  /**
   * The display line, split into explicit lines. Passing lines rather than
   * one string keeps the break deliberate instead of leaving it to Satori's
   * wrap heuristics, which cannot be previewed.
   */
  titleLines?: string[];
  /**
   * The display line as a single string — used when the copy is dynamic
   * (an article title, a fund matchup) and cannot be hand-broken. Broken
   * into one to three balanced lines, whichever holds the largest type.
   * Ignored when `titleLines` is given.
   */
  title?: string;
  /** Gray uppercase kicker above the display line. Written uppercase by the caller. */
  eyebrow?: string;
  /** One supporting sentence under the display line. Sentence case. */
  dek?: string;
  /** The single red moment. Written uppercase by the caller. */
  chipLabel: string;
  /** Whether the chip leads with a red-chip up-triangle signal mark. */
  chipMark?: boolean;
  /** Gray stat micro-label sitting beside the chip. Uppercase. */
  statLabel?: string;
  /**
   * Optional facts row under the chip — label/value pairs, max 4 shown.
   * The facts row is the dek said in numbers: pass one or the other, or
   * the auto-fit will squeeze the display line to pay for both.
   */
  stats?: InstrumentStat[];
  /** Micro-label to the right of the live dot in the masthead. Uppercase. */
  microLabel?: string;
  /** Footer micro-label row under the 1px ink rule. Uppercase. */
  footerNote?: string;
  /** Alt text for the social card. Mirrored by the route's `alt` export. */
  alt: string;
}

const SIZE = { width: 1200, height: 630 } as const;

// ── palette: pulled directly from the globals.css --ins-* tokens ───────────
const PAPER = "#ffffff";
const INK = "#111111";
const SIGNAL = "#e8442e";
const GRAY = "#767676";
const GRAY_700 = "#555555";

// Card gutter. The masthead bar, display line and footer rule all align to
// this column — the same alignment the site nav uses (bar inset to match the
// wordmark) rather than bleeding to the image edge.
const GUTTER = 72;
const PAD_Y = 56;

/** Usable content column: 1200 − two 72px gutters. */
const COLUMN = SIZE.width - GUTTER * 2; // 1056
/** Usable content height: 630 − two 56px pads. */
const INNER_H = SIZE.height - PAD_Y * 2; // 518

// Fixed block heights, used to auto-size the display line so no card can
// ever overflow. Measured against the rendered card, not guessed: they are
// the sum of each block's own type metrics plus its margin.
const MASTHEAD_H = 34 + 20 + 12; // wordmark line + gap + the 12px bar
const FOOTER_H = 1 + 15 + 17; // ink rule + gap + micro-label
const EYEBROW_H = 16 + 18; // kicker line + margin under it
const CHIP_H = 51; // 12/13 padding + a 21px line
const DEK_LINE_H = 31; // 23px at 1.35
const DEK_MT = 18;
const STATS_H = 28 + 67; // margin + (rule + label + gap + value)
const BREATHING = 26; // minimum slack the space-between should keep

/**
 * Average glyph advance for Archivo Bold, as a fraction of the font size.
 * Calibrated against the home card ("The whole world." at 116px fills the
 * 1056px column) and then rounded up: a title-case headline runs wider than
 * a lowercase one, and erring high only costs a step of display size where
 * clipping would cost the card.
 */
const DISPLAY_ADVANCE = 0.55;
/** Same, for the 23px dek in weight 600. */
const DEK_ADVANCE = 0.545;
const DEK_WIDTH = 980;
const DEK_CHARS_PER_LINE = Math.floor(DEK_WIDTH / (23 * DEK_ADVANCE)); // ~78

const DISPLAY_MAX = 116;
const DISPLAY_MIN = 44;

/**
 * Archivo 600/700/800 — the only family on the card.
 *
 * Uses the same `loadGoogleFont` helper (desktop-UA css2 fetch → TrueType,
 * memoized per edge worker) that the broadsheet cards have used in
 * production, so there is no new font-loading mechanism to break.
 *
 * Exported so bespoke cards that cannot use `renderInstrumentOG` — the
 * calculator share card at /api/og/invest — still draw from one font source.
 */
export async function loadInstrumentFonts() {
  const [semibold, bold, extrabold] = await Promise.all([
    loadGoogleFont("Archivo", { weight: 600 }),
    loadGoogleFont("Archivo", { weight: 700 }),
    loadGoogleFont("Archivo", { weight: 800 }),
  ]);

  return [
    { name: "Archivo", data: semibold, style: "normal" as const, weight: 600 as const },
    { name: "Archivo", data: bold, style: "normal" as const, weight: 700 as const },
    { name: "Archivo", data: extrabold, style: "normal" as const, weight: 800 as const },
  ];
}

/** Break `words` into `lineCount` lines of roughly equal measure. */
function balancedSplit(words: string[], lineCount: number): string[] {
  const target = words.join(" ").length / lineCount;
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    const linesLeft = lineCount - lines.length;
    // Break when the word would push this line further from the target
    // measure than stopping short of it would — but never on the last line,
    // which has to absorb whatever is left.
    if (
      current &&
      linesLeft > 1 &&
      next.length > target &&
      Math.abs(next.length - target) > Math.abs(current.length - target)
    ) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Every way a dynamic title could be broken, from one line up to three.
 * The renderer picks whichever candidate survives the column and the
 * vertical budget at the largest type size — a short title stays huge on
 * one line, a 75-character article headline steps down to three.
 */
export function displayCandidates(text: string): string[][] {
  const clean = text.trim().replace(/\s+/g, " ");
  const words = clean.split(" ");
  if (clean.length <= 18 || words.length < 2) return [[clean]];

  const max = Math.min(3, words.length);
  const out: string[][] = [[clean]];
  for (let n = 2; n <= max; n++) out.push(balancedSplit(words, n));
  return out;
}

/**
 * Trim a dek to a whole word so it can never spill past two lines. Satori
 * silently clips overflow, so the cut is made here where it is visible.
 */
function clampToWords(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const kept = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${kept.replace(/[\s.,;:—–-]+$/, "")}…`;
}

export async function renderInstrumentOG({
  titleLines,
  title,
  eyebrow,
  dek,
  chipLabel,
  chipMark = true,
  statLabel,
  stats,
  microLabel = "VEQT.TO · TORONTO",
  footerNote = "AN INDEPENDENT BROADSHEET ON THE BORING FUND — BUYVEQT.COM",
}: InstrumentOGProps) {
  const fonts = await loadInstrumentFonts();

  const facts = (stats ?? []).slice(0, 4);
  const dekText = dek ? clampToWords(dek, DEK_CHARS_PER_LINE * 2) : undefined;
  const dekLines = dekText
    ? Math.min(2, Math.ceil(dekText.length / DEK_CHARS_PER_LINE))
    : 0;

  // ── Auto-size the display line ────────────────────────────────────────
  // Every other block has a known height, so what is left over is the
  // display line's budget. Each line-break candidate is scored on width
  // (the longest line must fit the 1056px column) and height (the budget,
  // shared across its lines); the smaller cap wins, and the candidate with
  // the biggest surviving type size is the one that gets drawn.
  const chipMarginTop = dekText ? 34 : 44;
  const used =
    MASTHEAD_H +
    FOOTER_H +
    (eyebrow ? EYEBROW_H : 0) +
    (dekLines ? DEK_MT + dekLines * DEK_LINE_H : 0) +
    chipMarginTop +
    CHIP_H +
    (facts.length ? STATS_H : 0) +
    BREATHING;
  const titleBudget = INNER_H - used;

  const candidates =
    titleLines && titleLines.length > 0
      ? [titleLines]
      : displayCandidates(title ?? "");

  let lines = candidates[0];
  let displaySize = 0;
  for (const candidate of candidates) {
    const longest = candidate.reduce((n, l) => Math.max(n, l.length), 0);
    const widthCap =
      longest > 0 ? Math.floor(COLUMN / (longest * DISPLAY_ADVANCE)) : DISPLAY_MAX;
    const heightCap = Math.floor(titleBudget / (Math.max(candidate.length, 1) * 0.95));
    const size = Math.max(
      DISPLAY_MIN,
      Math.min(DISPLAY_MAX, widthCap, heightCap)
    );
    if (size > displaySize) {
      displaySize = size;
      lines = candidate;
    }
  }
  const displayTracking = Math.round(displaySize * -0.03 * 10) / 10;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: PAPER,
          fontFamily: "Archivo",
          color: INK,
          padding: `${PAD_Y}px ${GUTTER}px`,
        }}
      >
        {/* ── Masthead: wordmark + live micro-label, over the 12px bar ─── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Wordmark — 28px / w800 / 0.06em */}
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

            {/* Live dot + ticker micro-label */}
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
                {microLabel}
              </div>
            </div>
          </div>

          {/* The masthead bar — the site's 6px rule, scaled to 12px */}
          <div
            style={{
              display: "flex",
              height: 12,
              backgroundColor: INK,
              marginTop: 20,
            }}
          />
        </div>

        {/* ── Kicker + display line + dek + the one red chip ───────────── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow ? (
            <div
              style={{
                display: "flex",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 3.4,
                color: GRAY,
                marginBottom: 18,
              }}
            >
              {eyebrow}
            </div>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column" }}>
            {lines.map((line, i) => (
              <div
                key={`${i}-${line}`}
                style={{
                  display: "flex",
                  fontSize: displaySize,
                  fontWeight: 700,
                  letterSpacing: displayTracking,
                  lineHeight: 0.95,
                  color: INK,
                }}
              >
                {line}
              </div>
            ))}
          </div>

          {dekText ? (
            <div
              style={{
                display: "flex",
                fontSize: 23,
                fontWeight: 600,
                lineHeight: 1.35,
                letterSpacing: -0.2,
                color: GRAY_700,
                maxWidth: DEK_WIDTH,
                marginTop: DEK_MT,
              }}
            >
              {dekText}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: chipMarginTop,
            }}
          >
            {/* THE red moment — solid signal chip, radius 0 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: SIGNAL,
                padding: chipMark ? "12px 20px 13px 17px" : "12px 20px 13px",
                borderRadius: 0,
              }}
            >
              {chipMark ? (
                // Drawn, not typed: U+25B2 is outside Archivo's coverage, so
                // a "▲" glyph would render as tofu. Wrapped in a flex div so
                // the gutter is spaced by a normal layout node.
                <div
                  style={{
                    display: "flex",
                    width: 14,
                    height: 12,
                    marginRight: 11,
                  }}
                >
                  <svg width={14} height={12} viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="7,0 14,12 0,12" fill={PAPER} />
                  </svg>
                </div>
              ) : null}
              <div
                style={{
                  display: "flex",
                  fontSize: 21,
                  fontWeight: 800,
                  letterSpacing: 1.3,
                  color: PAPER,
                }}
              >
                {chipLabel}
              </div>
            </div>

            {statLabel ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 12.5,
                  fontWeight: 700,
                  letterSpacing: 2.2,
                  color: GRAY,
                  marginLeft: 22,
                }}
              >
                {statLabel}
              </div>
            ) : null}
          </div>

          {/* ── Facts row — the home hero's label-over-value grammar ──── */}
          {facts.length ? (
            <div style={{ display: "flex", marginTop: 28 }}>
              {facts.map((fact, i) => (
                <div
                  key={fact.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderTop: `1px solid ${INK}`,
                    paddingTop: 11,
                    minWidth: 168,
                    marginRight: i === facts.length - 1 ? 0 : 48,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 11.5,
                      fontWeight: 700,
                      letterSpacing: 2.4,
                      color: GRAY,
                    }}
                  >
                    {fact.label}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 30,
                      fontWeight: 700,
                      letterSpacing: -0.6,
                      color: INK,
                      marginTop: 5,
                    }}
                  >
                    {fact.value}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* ── Footer: 1px ink rule + micro-label ───────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              height: 1,
              backgroundColor: INK,
            }}
          />
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
            {footerNote}
          </div>
        </div>
      </div>
    ),
    { ...SIZE, fonts }
  );
}

export const OG_SIZE = SIZE;
export const OG_CONTENT_TYPE = "image/png";

export { PAPER, INK, SIGNAL, GRAY, GRAY_700 };
