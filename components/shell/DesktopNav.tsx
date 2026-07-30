"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LiveTickerPill from "./LiveTickerPill";

type NavId = "today" | "inside" | "compare" | "learn" | "calc" | "comm";

interface NavLink {
  id: NavId;
  label: string;
  href: string;
}

const NAV: NavLink[] = [
  { id: "today", label: "Today", href: "/" },
  { id: "inside", label: "Inside", href: "/inside-veqt" },
  { id: "compare", label: "Compare", href: "/compare" },
  { id: "learn", label: "Learn", href: "/learn" },
  { id: "calc", label: "Calculators", href: "/calculators" },
  { id: "comm", label: "Community", href: "/community" },
];

/* Secondary links (Distributions / Weekly / Methodology) live in
   <SiteFooter>. */

function activeFromPath(pathname: string): NavId | null {
  if (pathname === "/") return "today";
  if (pathname.startsWith("/inside-veqt")) return "inside";
  if (pathname.startsWith("/compare")) return "compare";
  if (pathname.startsWith("/learn")) return "learn";
  if (pathname.startsWith("/calculators")) return "calc";
  if (pathname.startsWith("/community")) return "comm";
  return null;
}

/**
 * Desktop sticky nav — the Instrument masthead. White paper, Archivo,
 * uppercase micro-label links, live ticker on the right, and the
 * signature 6px ink masthead bar underneath (edition-aware via
 * --ins-masthead). No blur, no radius, no shadows.
 */
export default function DesktopNav() {
  const pathname = usePathname() ?? "/";
  const active = activeFromPath(pathname);

  return (
    <nav
      className="hidden lg:block ins-shell ins-desktopnav"
      aria-label="Primary"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "var(--ins-paper)",
        fontFamily: "var(--ins-font)",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 28,
            padding: "18px 40px",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: "var(--ins-ink)",
              textDecoration: "none",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            BUYVEQT
          </Link>

          <div style={{ display: "flex", gap: 24, minWidth: 0 }}>
            {NAV.map((l) => {
              const isActive = l.id === active;
              return (
                <Link
                  key={l.id}
                  href={l.href}
                  aria-current={isActive ? "page" : undefined}
                  className="ins-nav-link"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: isActive ? "var(--ins-ink)" : "var(--ins-gray-700)",
                    borderBottom: isActive
                      ? "2px solid var(--ins-signal)"
                      : "2px solid transparent",
                    paddingBottom: 3,
                    textDecoration: "none",
                    transition: "color 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexShrink: 0,
            }}
          >
            <LiveTickerPill />
          </div>
        </div>

        {/* Masthead bar — edition-aware (ink by default, red on RALLY days). */}
        <div
          aria-hidden
          style={{
            margin: "0 40px",
            height: 6,
            background: "var(--ins-masthead)",
          }}
        />
      </div>

      <style jsx global>{`
        .ins-desktopnav a.ins-nav-link:hover {
          color: var(--ins-ink) !important;
        }
      `}</style>
    </nav>
  );
}
