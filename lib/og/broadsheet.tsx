import { ImageResponse } from "next/og";
import { loadBroadsheetFonts } from "./load-font";

/**
 * Shared "broadsheet" Open Graph card.
 *
 * Mirrors the on-site editorial system:
 *   - Cream paper background (#f6efdc)
 *   - Ink display headline in Fraunces
 *   - Soft gold rule + ink rule combos
 *   - Stamp-red brand mark
 *
 * Every route's `opengraph-image.tsx` is a four-line wrapper around this
 * function so social cards stay perfectly consistent.
 */
export interface BroadsheetOGProps {
  /** Small uppercase tag above the headline — section/category name. */
  eyebrow: string;
  /** The headline. Rendered in Fraunces 700 (or 400 italic if `italic`). */
  title: string;
  /** Whether to italicize the headline. Defaults to false. */
  italic?: boolean;
  /** Optional supporting line under the rule. */
  dek?: string;
  /** Optional ticker/stat row pinned to the bottom-left footer. */
  footerNote?: string;
  /** Alt text for the social card. Mirrored by the route's `alt` export. */
  alt: string;
}

const SIZE = { width: 1200, height: 630 } as const;

// ── palette: pulled directly from globals.css broadsheet tokens ────────────
const PAPER = "#f6efdc";
const PAPER_DEEP = "#ede3ca";
const INK = "#0f0d0a";
const INK_SOFT = "#2a2520";
const INK_MUTE = "#5b5147";
const RULE = "#b8a66e";
const STAMP = "#8a1c1c";

export async function renderBroadsheetOG({
  eyebrow,
  title,
  italic = false,
  dek,
  footerNote,
}: BroadsheetOGProps) {
  const fonts = await loadBroadsheetFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: PAPER,
          fontFamily: "Inter",
          color: INK,
          position: "relative",
          padding: "64px 80px",
        }}
      >
        {/* Hairline dot grid for paper texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(${RULE} 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            opacity: 0.10,
          }}
        />

        {/* Top thin gold rule, edge to edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: RULE,
            opacity: 0.6,
          }}
        />

        {/* ── Masthead row ─────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Wordmark */}
          <div
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: -0.5,
              color: INK,
            }}
          >
            <span>Buy</span>
            <span style={{ color: STAMP }}>VEQT</span>
          </div>

          {/* Edition marker — bibliographic info, right-aligned */}
          <div
            style={{
              display: "flex",
              fontSize: 14,
              fontWeight: 500,
              color: INK_MUTE,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            buyveqt.ca · est. 2024
          </div>
        </div>

        {/* Thick ink rule */}
        <div
          style={{
            position: "relative",
            height: 3,
            backgroundColor: INK,
            marginTop: 18,
            marginBottom: 60,
          }}
        />

        {/* ── Eyebrow tag ──────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            position: "relative",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: STAMP,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          {/* Short red rule next to the eyebrow */}
          <div
            style={{
              flex: 1,
              height: 1,
              backgroundColor: STAMP,
              opacity: 0.35,
              maxWidth: 240,
            }}
          />
        </div>

        {/* ── Headline ─────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            fontFamily: "Fraunces",
            fontWeight: italic ? 400 : 700,
            fontStyle: italic ? "italic" : "normal",
            fontSize: title.length > 48 ? 64 : title.length > 32 ? 76 : 92,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            color: INK,
            position: "relative",
            maxWidth: 1040,
          }}
        >
          {title}
        </div>

        {/* ── Optional dek under the headline ─────────────────────── */}
        {dek ? (
          <div
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 28,
              lineHeight: 1.3,
              color: INK_SOFT,
              marginTop: 28,
              position: "relative",
              maxWidth: 980,
            }}
          >
            {dek}
          </div>
        ) : null}

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            bottom: 56,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              height: 1,
              backgroundColor: RULE,
              opacity: 0.6,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Fraunces",
                fontStyle: "italic",
                fontSize: 18,
                color: INK_MUTE,
              }}
            >
              The VEQT investor community hub
            </div>
            {footerNote ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  fontWeight: 500,
                  color: INK_MUTE,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {footerNote}
              </div>
            ) : null}
          </div>
        </div>

        {/* Edge accent — bottom thin gold rule */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: RULE,
            opacity: 0.6,
          }}
        />

        {/* Stamp-red corner watermark — subtle */}
        <div
          style={{
            position: "absolute",
            top: 240,
            right: 80,
            width: 84,
            height: 84,
            border: `2px solid ${STAMP}`,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.18,
            transform: "rotate(-8deg)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 18,
              letterSpacing: 2,
              color: STAMP,
              textTransform: "uppercase",
            }}
          >
            V·EQT
          </div>
        </div>
      </div>
    ),
    { ...SIZE, fonts }
  );
}

export const OG_SIZE = SIZE;
export const OG_CONTENT_TYPE = "image/png";

// Re-export so individual route files don't need a second import.
export { PAPER, PAPER_DEEP, INK, INK_SOFT, INK_MUTE, RULE, STAMP };
