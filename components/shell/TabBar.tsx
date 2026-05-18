"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TabId = "today" | "inside" | "compare" | "learn" | "calc";

interface Tab {
  id: TabId;
  label: string;
  glyph: string;
  href: string;
}

const TABS: Tab[] = [
  { id: "today", label: "Today", glyph: "◆", href: "/" },
  { id: "inside", label: "Inside", glyph: "◇", href: "/inside-veqt" },
  { id: "compare", label: "Compare", glyph: "⇋", href: "/compare" },
  { id: "learn", label: "Learn", glyph: "☷", href: "/learn" },
  { id: "calc", label: "Calc", glyph: "∑", href: "/calculators" },
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
 * Active tab gets the vermilion stamp color; others sit muted.
 * Safe-area padding so the bar doesn't collide with the iOS home indicator.
 */
export default function TabBar() {
  const pathname = usePathname() ?? "/";
  const active = activeFromPath(pathname);

  return (
    <nav
      className="shell-tabbar ed-safe-bottom"
      aria-label="Primary"
      style={{
        background: "var(--paper-light)",
        borderTop: "1px solid var(--rule-soft)",
        paddingTop: 10,
        gridTemplateColumns: "repeat(5, 1fr)",
        textAlign: "center",
        fontFamily: "var(--font-sans)",
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
      }}
    >
      {TABS.map((t) => {
        const isActive = t.id === active;
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={isActive ? "page" : undefined}
            style={{
              color: isActive ? "var(--stamp)" : "var(--ink-mute)",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "2px 0",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden>
              {t.glyph}
            </span>
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
