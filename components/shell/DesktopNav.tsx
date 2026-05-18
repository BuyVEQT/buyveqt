"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import LiveTickerPill from "./LiveTickerPill";

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
 * Desktop sticky nav. Logo + nav links | centered live ticker | search + ★ Watch.
 * Shown above lg breakpoint; mobile uses TopBar + TabBar.
 */
export default function DesktopNav() {
  const pathname = usePathname() ?? "/";
  const active = activeFromPath(pathname);
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

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

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            aria-label="Search"
            disabled
            title="Search — coming soon"
            style={{
              background: "transparent",
              color: "var(--ink-soft)",
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid var(--rule-soft)",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "not-allowed",
              opacity: 0.7,
            }}
          >
            Search
          </button>
          <button
            type="button"
            aria-label="Watchlist"
            disabled
            title="Watchlist — coming soon"
            style={{
              background: "var(--ink)",
              color: "var(--paper-light)",
              padding: "8px 16px",
              borderRadius: 10,
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "not-allowed",
              opacity: 0.85,
            }}
          >
            ★ Watch
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More"
            aria-expanded={menuOpen}
            style={{
              appearance: "none",
              background: "transparent",
              border: "1px solid var(--rule-soft)",
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: 14,
              lineHeight: 1,
              color: "var(--ink-soft)",
              cursor: "pointer",
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 32,
            background: "var(--paper-light)",
            border: "1px solid var(--rule-soft)",
            borderRadius: 12,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: 200,
            boxShadow: "0 12px 30px rgba(15,13,10,0.10)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              toggleTheme();
              setMenuOpen(false);
            }}
            style={{
              appearance: "none",
              background: "transparent",
              border: 0,
              padding: "8px 10px",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--ink)",
              cursor: "pointer",
              textAlign: "left",
              borderRadius: 6,
            }}
          >
            Theme: {theme === "dark" ? "Dark" : "Light"} (toggle)
          </button>
          <Link href="/distributions" onClick={() => setMenuOpen(false)} style={menuLink()}>
            Distributions
          </Link>
          <Link href="/weekly" onClick={() => setMenuOpen(false)} style={menuLink()}>
            Weekly
          </Link>
          <Link href="/methodology" onClick={() => setMenuOpen(false)} style={menuLink()}>
            Methodology
          </Link>
        </div>
      )}
    </nav>
  );
}

function menuLink(): React.CSSProperties {
  return {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--ink)",
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 6,
  };
}
