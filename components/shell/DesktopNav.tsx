"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LiveTickerPill from "./LiveTickerPill";
import ThemeToggle from "./ThemeToggle";

type NavId = "today" | "inside" | "compare" | "learn" | "calc" | "comm";

interface NavLink {
  id: NavId;
  label: string;
  href: string;
}

const NAV: NavLink[] = [
  { id: "today", label: "Today", href: "/" },
  { id: "inside", label: "Inside VEQT", href: "/inside-veqt" },
  { id: "compare", label: "Compare", href: "/compare" },
  { id: "learn", label: "Learn", href: "/learn" },
  { id: "calc", label: "Calculators", href: "/calculators" },
  { id: "comm", label: "Community", href: "/community" },
];

/* Secondary links (Distributions / Weekly / Methodology) moved to
   <SiteFooter> after the theme toggle joined the nav right cluster
   and crowded the row. */

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
 * Desktop sticky nav. ONE navigation surface on desktop:
 *   logo + primary nav | centered live ticker | theme toggle.
 *
 * Secondary links (Distributions / Weekly / Methodology) used to sit
 * in the right cluster but moved to <SiteFooter> after the theme
 * toggle joined the nav and the row got too dense at < 1500px.
 */
export default function DesktopNav() {
  const pathname = usePathname() ?? "/";
  const active = activeFromPath(pathname);

  return (
    <nav
      className="hidden lg:block"
      aria-label="Primary"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "color-mix(in oklab, var(--paper) 94%, transparent)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--rule-soft)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 28,
          alignItems: "center",
          padding: "14px 32px",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: 22,
              letterSpacing: "-0.015em",
              color: "var(--ink)",
              textDecoration: "none",
            }}
          >
            Buy<span style={{ color: "var(--stamp)" }}>VEQT</span>
          </Link>
          <div style={{ display: "flex", gap: 22 }}>
            {NAV.map((l) => {
              const isActive = l.id === active;
              return (
                <Link
                  key={l.id}
                  href={l.href}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--ink)" : "var(--ink-soft)",
                    borderBottom: isActive ? "2px solid var(--stamp)" : "2px solid transparent",
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
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <LiveTickerPill />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "var(--ink-mute)",
          }}
        >
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
