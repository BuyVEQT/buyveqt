"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TabId = "today" | "inside" | "compare" | "learn" | "calc";

interface Tab {
  id: TabId;
  label: string;
  href: string;
}

const TABS: Tab[] = [
  { id: "today", label: "Today", href: "/" },
  { id: "inside", label: "Inside", href: "/inside-veqt" },
  { id: "compare", label: "Compare", href: "/compare" },
  { id: "learn", label: "Learn", href: "/learn" },
  { id: "calc", label: "Calc", href: "/calculators" },
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
 * Mobile bottom tab bar — Instrument grammar. Hidden above lg.
 *
 * Text-only per the mobile artboard: five equal columns of 8.5px w700
 * uppercase micro-labels. Active = ink with a 2px red tick bar at the
 * top edge of the cell (inset 30% each side); inactive = gray-400.
 * Solid white bar (no blur), 1px soft-hair top rule, no shadows, no
 * radius. Full-cell links keep tap targets ≥ 44px; safe-area padding
 * preserved for the iOS home indicator via `ed-safe-bottom`.
 */
export default function TabBar() {
  const pathname = usePathname() ?? "/";
  const active = activeFromPath(pathname);

  return (
    <nav className="tb ed-safe-bottom shell-tabbar ins-shell" aria-label="Primary">
      {TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={isActive ? "page" : undefined}
            className={`tb__tab${isActive ? " is-active" : ""}`}
          >
            <span className="tb__label">{t.label}</span>
          </Link>
        );
      })}

      {/* Global (not scoped) on purpose: styled-jsx doesn't attach its
          scope class to <Link> components — the tab links (the whole
          bar's content) never picked up the scoped rules. */}
      <style jsx global>{`
        .tb {
          grid-template-columns: repeat(5, 1fr);
          background: var(--ins-paper);
          border-top: 1px solid var(--ins-hair-soft);
          font-family: var(--ins-font);
        }
        .tb__tab {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 4px 2px;
          color: var(--ins-gray-400);
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
          transition: color 0.15s ease;
        }
        .tb__tab.is-active {
          color: var(--ins-ink);
        }
        /* Active indicator — 2px signal tick at the top edge of the
           cell, inset 30% from each side, so the eye picks the current
           tab without colour alone doing all the work. */
        .tb__tab.is-active::before {
          content: "";
          position: absolute;
          top: 0;
          left: 30%;
          right: 30%;
          height: 2px;
          background: var(--ins-signal);
        }
        .tb__label {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          line-height: 1;
        }
      `}</style>
    </nav>
  );
}
