"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isMarketOpen } from "@/lib/data/market-hours";
import { useTheme } from "@/components/ThemeProvider";

interface DateInfo {
  weekday: string;
  weekdayShort: string;
  full: string;
  compact: string;
  date: Date;
}

function todayInToronto(): DateInfo {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(now).map((p) => [p.type, p.value])
  );
  const weekdayShort = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "short",
  }).format(now);
  const numParts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value])
  );
  const torontoDate = new Date(
    Number(numParts.year),
    Number(numParts.month) - 1,
    Number(numParts.day)
  );
  return {
    weekday: parts.weekday ?? "",
    weekdayShort,
    full: `${parts.weekday}, ${parts.month} ${parts.day}, ${parts.year}`,
    compact: `${parts.weekday}, ${parts.month} ${parts.day}`,
    date: torontoDate,
  };
}

// ISO 8601 week number (Mon-start, week 1 contains Jan 4).
function isoWeekNumber(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(
    ((t.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7
  );
}

function toRoman(n: number): string {
  if (n <= 0) return "I";
  const map: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  let r = n;
  for (const [v, s] of map) {
    while (r >= v) {
      out += s;
      r -= v;
    }
  }
  return out;
}

const DEPARTMENTS = [
  { href: "/invest", label: "Calculators" },
  { href: "/compare", label: "Compare" },
  { href: "/learn", label: "Learn" },
  { href: "/inside-veqt", label: "Inside VEQT" },
  { href: "/community", label: "Community" },
];

const DRAWER_SECONDARY = [
  { href: "/distributions", label: "Distributions" },
  { href: "/methodology", label: "Methodology" },
];

// Volume number = year - launch year. Launch year picked so the round-2
// edition string starts at Vol. II in 2026 (matching the mockup feel).
const VOL_LAUNCH_YEAR = 2024;

export default function Masthead() {
  const [date, setDate] = useState<DateInfo>(() => ({
    weekday: "",
    weekdayShort: "",
    full: "",
    compact: "",
    date: new Date(),
  }));
  const [edition, setEdition] = useState("");
  const [marketOpen, setMarketOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const tick = () => {
      const today = todayInToronto();
      setDate(today);
      setMarketOpen(isMarketOpen());
      const vol = Math.max(1, today.date.getFullYear() - VOL_LAUNCH_YEAR);
      const no = isoWeekNumber(today.date);
      setEdition(
        `${today.weekdayShort} · Vol. ${toRoman(vol)} · No. ${no}`
      );
    };
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Close drawer on Escape; lock body scroll while open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <header className="border-b border-[var(--ink)] pt-2 pb-2 relative z-10">
      {/* ── Single top row: live state · date · nav (desktop) · theme/hamburger ── */}
      <div className="grid items-center gap-3 sm:gap-6 pb-2 grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto]">
        {marketOpen ? (
          <span className="bs-stamp">
            <span className="bs-live-dot" />
            Live Wire
          </span>
        ) : (
          <span className="bs-label text-[var(--ink-soft)] whitespace-nowrap">
            <span
              aria-hidden
              className="inline-block w-[6px] h-[6px] rounded-full bg-[var(--ink-soft)] align-middle mr-[0.45em]"
            />
            After Hours
          </span>
        )}

        {/* Date — compact on mobile, full on desktop */}
        <span className="bs-label tabular-nums text-[var(--ink-soft)] truncate">
          <span className="hidden sm:inline">{date.full || " "}</span>
          <span className="sm:hidden">{date.compact || " "}</span>
        </span>

        {/* Desktop department rail — replaces the old standalone nav row */}
        <nav className="hidden sm:flex items-center gap-5 lg:gap-8 bs-label">
          {DEPARTMENTS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap hover:text-[var(--stamp)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="sm:hidden inline-flex items-center gap-2 bs-label hover:text-[var(--stamp)] transition-colors"
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
        >
          <svg
            width="16"
            height="12"
            viewBox="0 0 16 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <line x1="0" y1="1" x2="16" y2="1" />
            <line x1="0" y1="6" x2="16" y2="6" />
            <line x1="0" y1="11" x2="16" y2="11" />
          </svg>
          <span className="hidden xs:inline">Menu</span>
        </button>

        {/* Desktop theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="hidden sm:inline-flex items-center gap-1.5 bs-label hover:text-[var(--stamp)] transition-colors"
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <circle cx="12" cy="12" r="4.5" />
              <path
                strokeLinecap="round"
                d="M12 2v2M12 20v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2 12h2M20 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4"
              />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"
              />
            </svg>
          )}
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </div>

      <div className="bs-rule-thick" />

      {/* ── Compressed nameplate: title + edition string on one line ── */}
      <div className="flex items-baseline justify-between gap-4 py-2 sm:py-3">
        <Link href="/" className="block min-w-0">
          <h1 className="bs-display text-[var(--ink)] text-[1.5rem] sm:text-[1.875rem] leading-[1] tracking-[-0.018em]">
            The VEQT Daily
          </h1>
        </Link>
        <span className="hidden sm:inline bs-display italic text-[12px] text-[var(--ink-soft)] whitespace-nowrap">
          {edition || " "}
        </span>
      </div>

      <div className="bs-rule-thin" />

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 sm:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-[var(--ink)]/60"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Panel */}
          <div
            className="absolute inset-y-0 right-0 w-[85%] max-w-[340px] bg-[var(--paper)] border-l border-[var(--ink)] p-6 flex flex-col animate-slide-in-right"
            style={{ boxShadow: "-10px 0 30px rgba(0,0,0,0.18)" }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--ink)]">
              <span className="bs-stamp">The Masthead</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="bs-label p-1 hover:text-[var(--stamp)] transition-colors"
                aria-label="Close"
              >
                Close ×
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1">
              {DEPARTMENTS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setDrawerOpen(false)}
                  className="bs-display text-2xl py-2 border-b border-[var(--color-border)] hover:text-[var(--stamp)] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8">
              <p className="bs-label mb-2">Also in the paper</p>
              <div className="flex flex-col gap-2">
                {DRAWER_SECONDARY.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setDrawerOpen(false)}
                    className="bs-link text-sm"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 bs-label hover:text-[var(--stamp)] transition-colors"
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {theme === "dark" ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    aria-hidden
                  >
                    <circle cx="12" cy="12" r="4.5" />
                    <path
                      strokeLinecap="round"
                      d="M12 2v2M12 20v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2 12h2M20 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4"
                    />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"
                    />
                  </svg>
                )}
                <span>
                  {theme === "dark" ? "Switch to light" : "Switch to dark"}
                </span>
              </button>
            </div>

            <div className="mt-auto pt-6 border-t border-[var(--color-border)]">
              <p className="bs-caption italic">
                Every Sunday, and whenever the market requires it.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
