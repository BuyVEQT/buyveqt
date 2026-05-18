"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import Link from "next/link";
import LiveTickerPill from "./LiveTickerPill";

interface RouteChrome {
  title: string;
  kicker?: string;
  /** Hide the live ticker (used on `/` where the hero owns it). */
  hideTicker?: boolean;
  /** Hide the back arrow (used on `/`). */
  hideBack?: boolean;
  /** Hide the entire bar (rare). */
  hide?: boolean;
}

function chromeForPath(pathname: string): RouteChrome {
  if (pathname === "/")
    return { title: "Today", hideBack: true, hideTicker: true };
  if (pathname.startsWith("/inside-veqt"))
    return { title: "Inside VEQT", kicker: "Today" };
  if (pathname.startsWith("/compare"))
    return { title: "VEQT × the field", kicker: "Compare" };
  if (pathname.startsWith("/learn/")) return { title: "Article", kicker: "Learn · Read" };
  if (pathname.startsWith("/learn")) return { title: "Learn", kicker: "Read" };
  if (pathname.startsWith("/calculators"))
    return { title: "Calculators", kicker: "Tools" };
  if (pathname.startsWith("/community"))
    return { title: "Community", kicker: "Letters" };
  if (pathname.startsWith("/distributions"))
    return { title: "Distributions", kicker: "Calendar" };
  if (pathname.startsWith("/weekly"))
    return { title: "Weekly", kicker: "Read" };
  if (pathname.startsWith("/methodology"))
    return { title: "Methodology", kicker: "About" };
  return { title: "" };
}

/**
 * Mobile sticky top app bar. Hidden above lg (desktop uses DesktopNav).
 * Derives title/kicker/back/ticker from the current pathname.
 *
 * Action-drawer (☰) holds theme toggle + secondary nav.
 */
export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const chrome = chromeForPath(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  if (chrome.hide) return null;

  return (
    <>
      <div
        className="shell-topbar"
        style={{
          background: "color-mix(in oklab, var(--paper) 94%, transparent)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--rule-soft)",
          padding: "12px 16px",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
          {!chrome.hideBack ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back"
              style={{
                appearance: "none",
                background: "transparent",
                border: 0,
                color: "var(--ink-soft)",
                fontSize: 26,
                lineHeight: 0.6,
                cursor: "pointer",
                padding: 0,
                marginTop: -4,
              }}
            >
              ‹
            </button>
          ) : (
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: 18,
                color: "var(--ink)",
                letterSpacing: "-0.015em",
                textDecoration: "none",
              }}
            >
              Buy<span style={{ color: "var(--stamp)" }}>VEQT</span>
            </Link>
          )}
          {!chrome.hideBack && (
            <div style={{ minWidth: 0 }}>
              {chrome.kicker && (
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--ink-mute)",
                  }}
                >
                  {chrome.kicker}
                </div>
              )}
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 17,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {chrome.title}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!chrome.hideTicker && <LiveTickerPill compact />}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            style={{
              appearance: "none",
              background: "transparent",
              border: 0,
              color: "var(--ink-soft)",
              cursor: "pointer",
              padding: 4,
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="shell-topbar-drawer"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 280,
              maxWidth: "85vw",
              height: "100dvh",
              background: "var(--paper-light)",
              borderLeft: "1px solid var(--rule-soft)",
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--ink-mute)",
              }}
            >
              More
            </div>
            <Link href="/community" onClick={() => setMenuOpen(false)} style={menuLink()}>
              Community
            </Link>
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
        </div>
      )}
    </>
  );
}

function menuLink(): React.CSSProperties {
  return {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--ink)",
    textDecoration: "none",
    padding: "8px 0",
    borderBottom: "1px solid var(--rule-soft)",
  };
}
