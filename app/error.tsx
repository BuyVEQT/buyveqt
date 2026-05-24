"use client";

// Error boundary for app/* segments. Next requires this file to be a
// client component because the `reset` prop is a callback. The render
// stays small — no live data, no charts — so a broken downstream page
// doesn't drag a heavy bundle into the error screen.
import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  // Log to the console in dev. In prod, Vercel + Sentry (if added later)
  // would pick up uncaught errors directly; this is just a breadcrumb.
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
        background: "var(--paper)",
        color: "var(--ink)",
      }}
    >
      <div style={{ maxWidth: 560, width: "100%" }}>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
            marginBottom: 14,
          }}
        >
          The press jammed
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            marginBottom: 18,
          }}
        >
          Something went wrong{" "}
          <em
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            rendering this page.
          </em>
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 16,
            lineHeight: 1.55,
            color: "var(--ink-soft)",
            maxWidth: "52ch",
            marginBottom: 28,
          }}
        >
          A live data fetch or render failed. Try again — it&rsquo;s often
          transient. If the problem persists, head back to{" "}
          <Link href="/" style={{ color: "var(--ink)" }}>
            Today
          </Link>{" "}
          or write us at{" "}
          <a
            href="https://www.reddit.com/r/JustBuyVEQT/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--ink)" }}
          >
            r/JustBuyVEQT
          </a>
          .
        </p>
        {error.digest && (
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "var(--ink-mute)",
              marginBottom: 24,
            }}
          >
            Reference: <code>{error.digest}</code>
          </p>
        )}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              appearance: "none",
              border: "none",
              background: "var(--ink)",
              color: "var(--paper-light)",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "12px 20px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              appearance: "none",
              border: "1px solid var(--rule-soft)",
              background: "transparent",
              color: "var(--ink)",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              padding: "12px 20px",
              borderRadius: 10,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Back to today
          </Link>
        </div>
      </div>
    </div>
  );
}
