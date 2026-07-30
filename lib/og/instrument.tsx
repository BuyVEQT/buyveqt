import { ImageResponse } from "next/og";
import { loadGoogleFont } from "./load-font";

/**
 * "Instrument" Open Graph card — the social-card twin of the home redesign.
 *
 * Design language (Swiss instrument panel, per the v2 handoff):
 *   - White page (#ffffff), ink (#111111), and ONE signal-red accent
 *   - Archivo grotesk only — emphasis is weight + red, never slant
 *   - Radius 0, no shadows, no gradients, everything uppercase except the
 *     display line
 *   - The site's signature 6px masthead bar, scaled to 12px for the card
 *
 * Tokens mirror `--ins-*` in app/globals.css so the card and the page can
 * never drift.
 */
export interface InstrumentOGProps {
  /**
   * The display line, split into explicit lines. Passing lines rather than
   * one string keeps the break deliberate instead of leaving it to Satori's
   * wrap heuristics, which cannot be previewed.
   */
  titleLines: string[];
  /** The single red moment. Written uppercase by the caller. */
  chipLabel: string;
  /** Whether the chip leads with a red-chip up-triangle signal mark. */
  chipMark?: boolean;
  /** Gray stat micro-label sitting beside the chip. Uppercase. */
  statLabel?: string;
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

// Card gutter. The masthead bar, display line and footer rule all align to
// this column — the same alignment the site nav uses (bar inset to match the
// wordmark) rather than bleeding to the image edge.
const GUTTER = 72;

/**
 * Archivo 600/700/800 — the only family on the card.
 *
 * Uses the same `loadGoogleFont` helper (desktop-UA css2 fetch → TrueType,
 * memoized per edge worker) that the broadsheet cards have used in
 * production, so there is no new font-loading mechanism to break.
 */
async function loadInstrumentFonts() {
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

export async function renderInstrumentOG({
  titleLines,
  chipLabel,
  chipMark = true,
  statLabel,
  microLabel = "VEQT.TO · TORONTO",
  footerNote = "AN INDEPENDENT BROADSHEET ON THE BORING FUND — BUYVEQT.COM",
}: InstrumentOGProps) {
  const fonts = await loadInstrumentFonts();

  // Step the display size down for longer lines so nothing can overflow the
  // 1056px content column. Tracking stays at a constant -0.03em.
  const longest = titleLines.reduce((n, l) => Math.max(n, l.length), 0);
  const displaySize = longest > 24 ? 88 : longest > 20 ? 100 : longest > 17 ? 108 : 116;
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
          padding: `56px ${GUTTER}px`,
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

        {/* ── Display line + the one red chip ──────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {titleLines.map((line) => (
              <div
                key={line}
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 44,
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

export { PAPER, INK, SIGNAL, GRAY };
