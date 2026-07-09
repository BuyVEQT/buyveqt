"use client";

/**
 * ThemeToggle — tri-state Morning · Auto · Evening segmented control.
 *
 * The Late Edition deployment lives behind a single user-facing
 * control. We deliberately avoid sun/moon emoji — a small editorial
 * pill matches the broadsheet voice better and keeps the chrome quiet
 * on dense nav surfaces.
 *
 * Two variants:
 *   - default: full 3-segment pill (used in DesktopNav)
 *   - compact: icon-only single button that cycles auto → light →
 *              dark on tap (used in the mobile drawer where space is
 *              tight)
 */
import { useTheme, type ThemePref } from "@/components/ThemeProvider";

const ORDER: ThemePref[] = ["auto", "light", "dark"];

function nextPref(current: ThemePref): ThemePref {
  const i = ORDER.indexOf(current);
  return ORDER[(i + 1) % ORDER.length];
}

const LABELS: Record<ThemePref, { full: string; short: string; aria: string }> = {
  auto: { full: "Auto", short: "A", aria: "Auto theme (follows system)" },
  light: { full: "Morning", short: "M", aria: "Morning edition (light)" },
  dark: { full: "Evening", short: "E", aria: "Late edition (dark)" },
};

interface ThemeToggleProps {
  compact?: boolean;
  /** Optional className for layout hooks (margins, etc.) */
  className?: string;
}

export default function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { pref, setPref } = useTheme();

  if (compact) {
    const next = nextPref(pref);
    return (
      <button
        type="button"
        onClick={() => setPref(next)}
        aria-label={`Theme: ${LABELS[pref].aria}. Tap for ${LABELS[next].aria}.`}
        title={`Theme: ${LABELS[pref].full}`}
        className={className}
        style={{
          appearance: "none",
          background: "transparent",
          border: "1px solid var(--rule-soft)",
          borderRadius: 999,
          padding: "4px 10px",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          color: "var(--ink-soft)",
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        <ThemeGlyph pref={pref} />
        <span style={{ marginTop: 1 }}>{LABELS[pref].full}</span>
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`tt-pill${className ? ` ${className}` : ""}`}
    >
      {ORDER.map((p) => {
        const active = p === pref;
        return (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={LABELS[p].aria}
            onClick={() => setPref(p)}
            title={LABELS[p].full}
            className={`tt-seg${active ? " is-active" : ""}`}
          >
            <ThemeGlyph pref={p} active={active} />
            <span className="tt-seg__label">{LABELS[p].full}</span>
          </button>
        );
      })}
      <style jsx>{`
        .tt-pill {
          display: inline-flex;
          background: var(--paper-warm);
          border: 1px solid var(--rule-soft);
          border-radius: 999px;
          padding: 2px;
          gap: 1px;
        }
        .tt-seg {
          appearance: none;
          background: transparent;
          color: var(--ink-soft);
          border: 0;
          border-radius: 999px;
          padding: 4px 9px;
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          line-height: 1;
          transition: background 0.15s, color 0.15s;
        }
        .tt-seg.is-active {
          background: var(--ink);
          color: var(--band-paper);
        }
        .tt-seg__label {
          margin-top: 1px;
        }
        /* Below 1280px (smaller desktops + 13" laptops) drop the labels
           on the non-active segments to claw back ~70px of nav width.
           Active segment keeps its label so the current selection
           stays legible at a glance. */
        @media (max-width: 1279px) {
          .tt-seg:not(.is-active) .tt-seg__label {
            display: none;
          }
          .tt-seg {
            padding: 4px 7px;
          }
        }
        /* Below 1140px drop ALL labels — glyph-only pill. */
        @media (max-width: 1139px) {
          .tt-seg .tt-seg__label {
            display: none;
          }
          .tt-seg {
            padding: 4px 6px;
          }
        }
      `}</style>
    </div>
  );
}

interface ThemeGlyphProps {
  pref: ThemePref;
  active?: boolean;
}

function ThemeGlyph({ pref, active }: ThemeGlyphProps) {
  // 10px symbols — kept geometric so they don't fight the type.
  // Morning: filled disc (sunrise dot).
  // Auto:    half-filled disc (◐).
  // Evening: ring with a notch (waxing moon).
  const fill = active ? "currentColor" : "currentColor";
  const opacity = active ? 1 : 0.7;
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true" style={{ flexShrink: 0 }}>
      <g fill={fill} opacity={opacity}>
        {pref === "light" && (
          <circle cx="6" cy="6" r="3.4" />
        )}
        {pref === "auto" && (
          <>
            <circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M6 1.8 A4.2 4.2 0 0 1 6 10.2 Z" />
          </>
        )}
        {pref === "dark" && (
          <path d="M9 7.6 A4 4 0 1 1 7.4 3 A3 3 0 0 0 9 7.6 Z" />
        )}
      </g>
    </svg>
  );
}
