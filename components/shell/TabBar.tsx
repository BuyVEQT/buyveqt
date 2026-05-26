"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TabId = "today" | "inside" | "compare" | "learn" | "calc";

interface Tab {
  id: TabId;
  label: string;
  href: string;
  /** Compact 22×22 viewBox SVG path strings; stroke="currentColor" so the
   *  active tone propagates from the link wrapper. */
  icon: React.ReactNode;
}

/* ── Icon set ────────────────────────────────────────────────────────────
 * Hand-tuned 22×22 line glyphs at strokeWidth 1.6, round caps + joins.
 * Replaces the old decorative Unicode characters (◆◇⇋☷∑) which read as
 * abstract symbols rather than navigation icons.
 * ────────────────────────────────────────────────────────────────────── */

function IconToday() {
  // Sun half-disc — anchors to the home page's weather glyph language
  return (
    <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden>
      <circle cx="11" cy="11" r="4.2" fill="currentColor" opacity="0.18" />
      <circle
        cx="11"
        cy="11"
        r="4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <line x1="11" y1="2.5" x2="11" y2="4.5" />
        <line x1="11" y1="17.5" x2="11" y2="19.5" />
        <line x1="2.5" y1="11" x2="4.5" y2="11" />
        <line x1="17.5" y1="11" x2="19.5" y2="11" />
        <line x1="5" y1="5" x2="6.4" y2="6.4" />
        <line x1="15.6" y1="15.6" x2="17" y2="17" />
        <line x1="17" y1="5" x2="15.6" y2="6.4" />
        <line x1="6.4" y1="15.6" x2="5" y2="17" />
      </g>
    </svg>
  );
}

function IconInside() {
  // Stacked layers — what the fund "contains"
  return (
    <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M11 3 L19 7 L11 11 L3 7 Z" />
        <path d="M3 11 L11 15 L19 11" opacity="0.7" />
        <path d="M3 15 L11 19 L19 15" opacity="0.5" />
      </g>
    </svg>
  );
}

function IconCompare() {
  // Two arrows swapping — left-going + right-going
  return (
    <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 7 H17 M14 4 L17 7 L14 10" />
        <path d="M18 15 H5 M8 12 L5 15 L8 18" />
      </g>
    </svg>
  );
}

function IconLearn() {
  // Open book
  return (
    <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 5 C 5 5 8 5.5 11 7 C 14 5.5 17 5 19 5 L19 17 C 17 17 14 17.5 11 19 C 8 17.5 5 17 3 17 Z" />
        <line x1="11" y1="7" x2="11" y2="19" />
      </g>
    </svg>
  );
}

function IconCalc() {
  // Calculator grid
  return (
    <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="3" width="14" height="16" rx="2.4" />
        <line x1="4" y1="8" x2="18" y2="8" />
        <line x1="7" y1="12" x2="7" y2="12" />
        <line x1="11" y1="12" x2="11" y2="12" />
        <line x1="15" y1="12" x2="15" y2="12" />
        <line x1="7" y1="15.5" x2="7" y2="15.5" />
        <line x1="11" y1="15.5" x2="11" y2="15.5" />
        <line x1="15" y1="15.5" x2="15" y2="15.5" />
      </g>
    </svg>
  );
}

const TABS: Tab[] = [
  { id: "today", label: "Today", href: "/", icon: <IconToday /> },
  { id: "inside", label: "Inside", href: "/inside-veqt", icon: <IconInside /> },
  { id: "compare", label: "Compare", href: "/compare", icon: <IconCompare /> },
  { id: "learn", label: "Learn", href: "/learn", icon: <IconLearn /> },
  { id: "calc", label: "Calc", href: "/calculators", icon: <IconCalc /> },
];

function activeFromPath(pathname: string): TabId | null {
  if (pathname === "/") return "today";
  if (pathname.startsWith("/inside-veqt")) return "inside";
  if (pathname.startsWith("/compare")) return "compare";
  if (pathname.startsWith("/learn")) return "learn";
  if (pathname.startsWith("/calculators")) return "calc";
  return null;
}

/**
 * Mobile bottom tab bar. Hidden above lg.
 *
 * Polish round (Jun 2026):
 *   • Replaced abstract Unicode glyphs (◆◇⇋☷∑) with proper 22×22 line icons.
 *   • Active state: vermilion icon + label + a 2px vermilion top hairline
 *     under the bar's top edge (per-cell), not just a colour swap.
 *   • Smooth colour/scale transitions on tap.
 *   • Surface separated from page content with a soft drop-shadow + a
 *     paper-light background that picks up `backdrop-filter: blur` on
 *     browsers that support it.
 *   • Each `<Link>` is a full-cell flex column so the entire tile is
 *     tappable, not just the icon + label inline area.
 *   • Safe-area padding preserved for the iOS home indicator.
 */
export default function TabBar() {
  const pathname = usePathname() ?? "/";
  const active = activeFromPath(pathname);

  return (
    <nav className="tb ed-safe-bottom shell-tabbar" aria-label="Primary">
      {TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={isActive ? "page" : undefined}
            className={`tb__tab${isActive ? " is-active" : ""}`}
          >
            <span className="tb__icon" aria-hidden>
              {t.icon}
            </span>
            <span className="tb__label">{t.label}</span>
          </Link>
        );
      })}

      <style jsx>{`
        .tb {
          grid-template-columns: repeat(5, 1fr);
          background: color-mix(
            in oklab,
            var(--paper-light) 88%,
            transparent
          );
          backdrop-filter: blur(14px) saturate(1.4);
          -webkit-backdrop-filter: blur(14px) saturate(1.4);
          border-top: 1px solid var(--rule-soft);
          box-shadow: 0 -8px 24px rgba(15, 13, 10, 0.06);
          padding-top: 6px;
          font-family: var(--font-sans);
        }
        .tb__tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 6px 4px 8px;
          color: var(--ink-mute);
          text-decoration: none;
          position: relative;
          transition:
            color 0.18s ease,
            transform 0.12s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .tb__tab:active {
          transform: translateY(0.5px) scale(0.97);
        }
        .tb__tab.is-active {
          color: var(--stamp);
        }
        /* Active indicator — a 2px vermilion bar at the top edge of the
           cell so the eye picks the current tab without colour alone
           doing all the work. */
        .tb__tab.is-active::before {
          content: "";
          position: absolute;
          top: -7px;
          left: 22%;
          right: 22%;
          height: 2px;
          background: var(--stamp);
          border-radius: 0 0 2px 2px;
        }
        .tb__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          transition: transform 0.18s ease;
        }
        .tb__tab.is-active .tb__icon {
          transform: translateY(-1px);
        }
        .tb__label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          line-height: 1;
          /* No more 0.16em-spaced uppercase — too tight at 9.5px, made
             the labels feel mashed. Caps comes from CSS rather than
             being baked into the spacing. */
          text-transform: none;
        }
        .tb__tab.is-active .tb__label {
          font-weight: 700;
        }

        /* Slightly tighter padding at very-narrow phones so all 5 tabs
           still fit comfortably without the labels truncating. */
        @media (max-width: 360px) {
          .tb__tab {
            padding: 6px 2px 8px;
          }
          .tb__label {
            font-size: 9.5px;
          }
        }
      `}</style>
    </nav>
  );
}
