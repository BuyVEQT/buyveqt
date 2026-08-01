"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
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
 * Mobile sticky top app bar — Instrument masthead. Hidden above lg
 * (desktop uses DesktopNav). White paper, "BUYVEQT" wordmark on home,
 * kicker + title on inner routes, live dot cluster + ☰ drawer on the
 * right, and the 5px ink masthead bar underneath (edition-aware).
 *
 * Action-drawer (☰) holds the secondary nav.
 */
export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const chrome = chromeForPath(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Guards the focus restore so the first render doesn't yank focus to ☰.
  const wasOpenRef = useRef(false);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  // Escape dismisses the drawer — the scrim used to be the only way out.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Focus enters at the ✕ on open and returns to ☰ on close.
  useEffect(() => {
    if (menuOpen) {
      wasOpenRef.current = true;
      closeButtonRef.current?.focus();
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      menuButtonRef.current?.focus();
    }
  }, [menuOpen]);

  if (chrome.hide) return null;

  return (
    <>
      <div
        className="shell-topbar ins-shell"
        style={{
          flexDirection: "column",
          background: "var(--ins-paper)",
          fontFamily: "var(--ins-font)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
            {!chrome.hideBack ? (
              <button
                type="button"
                onClick={handleBack}
                aria-label="Back"
                /* Turn 8 touch targets: the padding/negative-margin pair
                   grows the hit area to ~45×44 without moving the glyph or
                   growing the bar — the chevron's own box is only 14px
                   tall, so a plain min-height would have pushed the whole
                   masthead down. */
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: 0,
                  color: "var(--ins-ink)",
                  fontSize: 24,
                  lineHeight: 0.6,
                  cursor: "pointer",
                  padding: "15px 19px",
                  margin: "-15px -19px",
                  marginTop: -18,
                }}
              >
                ‹
              </button>
            ) : (
              <Link
                href="/"
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  color: "var(--ins-ink)",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                BUYVEQT
              </Link>
            )}
            {!chrome.hideBack && (
              <div style={{ minWidth: 0 }}>
                {chrome.kicker && (
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--ins-gray-600)",
                    }}
                  >
                    {chrome.kicker}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--ins-ink)",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.15,
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

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {chrome.hideTicker ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "var(--ins-ink)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: "var(--ins-signal)",
                    animation: "ins-pulse 2.2s ease-in-out infinite",
                    flexShrink: 0,
                  }}
                />
                LIVE
              </span>
            ) : (
              <LiveTickerPill compact />
            )}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-controls="topbar-drawer"
              /* Same padding/negative-margin trick as the back chevron:
                 44×44 of hit area, unchanged glyph position and bar
                 height. The right-side overhang runs into the live-ticker
                 span, which is not interactive, so nothing is stolen. */
              style={{
                appearance: "none",
                background: "transparent",
                border: 0,
                color: "var(--ins-ink)",
                cursor: "pointer",
                padding: "14px",
                margin: "-14px",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Masthead bar — edition-aware (ink by default, red on RALLY days). */}
        <div
          aria-hidden
          style={{
            margin: "0 20px",
            height: 5,
            background: "var(--ins-masthead)",
          }}
        />
      </div>

      {menuOpen && (
        <div
          id="topbar-drawer"
          className="shell-topbar-drawer ins-shell"
          role="dialog"
          aria-modal="true"
          aria-label="More sections"
        >
          <div
            role="presentation"
            onClick={() => setMenuOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(17,17,17,0.4)" }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 280,
              maxWidth: "85vw",
              height: "100dvh",
              background: "var(--ins-paper)",
              borderLeft: "1px solid var(--ins-hair)",
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              fontFamily: "var(--ins-font)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--ins-gray-600)",
                }}
              >
                More
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  appearance: "none",
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "1px solid var(--ins-ink)",
                  borderRadius: 0,
                  color: "var(--ins-ink)",
                  fontSize: 13,
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ✕
              </button>
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

/* Drawer rows. The links are flex items, so they blockify and the vertical
   padding is real hit area: 11px of type at ~13px line box + 2×16px pads
   to 45px, clearing the 44px floor. (They were 12px pads / ~37px.) */
function menuLink(): React.CSSProperties {
  return {
    fontFamily: "var(--ins-font)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--ins-ink)",
    textDecoration: "none",
    padding: "16px 0",
    borderBottom: "1px solid var(--ins-hair)",
  };
}
