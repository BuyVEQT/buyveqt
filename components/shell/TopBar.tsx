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
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: 0,
                  color: "var(--ins-ink)",
                  fontSize: 24,
                  lineHeight: 0.6,
                  cursor: "pointer",
                  padding: 0,
                  marginTop: -3,
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
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.22em",
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
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              style={{
                appearance: "none",
                background: "transparent",
                border: 0,
                color: "var(--ins-ink)",
                cursor: "pointer",
                padding: 4,
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
          className="shell-topbar-drawer ins-shell"
          role="dialog"
          aria-modal="true"
        >
          <div
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
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--ins-gray-600)",
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
    fontFamily: "var(--ins-font)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--ins-ink)",
    textDecoration: "none",
    padding: "12px 0",
    borderBottom: "1px solid var(--ins-hair)",
  };
}
