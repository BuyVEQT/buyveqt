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

/**
 * The Instrument's failure state. Same grammar as every other page —
 * kicker, display line, dek, one ruled block — with the red spent on the
 * single action that might fix it.
 *
 * styled-jsx is available here (this is already a client component), but it
 * does not attach its scope class to <Link>, so the one anchor is reached
 * through `:global()` under a scoped parent. Buttons and plain elements
 * scope normally.
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  // Log to the console in dev. In prod, Vercel + Sentry (if added later)
  // would pick up uncaught errors directly; this is just a breadcrumb.
  useEffect(() => {

    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="ins-root errx">
      <div className="errx__page">
        <div className="errx__kicker">Something broke · Not your portfolio</div>
        <h1 className="errx__display">An error, on our side.</h1>
        <p className="errx__dek">
          A page failed to render. Your holdings, your brokerage and your money
          are entirely unaffected — nothing here ever touches them. Most of
          these are a stalled data fetch and clear on a retry; if this one
          doesn&rsquo;t, the site is having a bad minute and not you.
        </p>

        {error.digest && (
          <p className="errx__ref">
            Reference · <span className="errx__digest">{error.digest}</span>
          </p>
        )}

        <div className="errx__actions">
          <button type="button" onClick={() => reset()} className="errx__try">
            Try again
          </button>
          <span className="errx__home">
            <Link href="/">Back to today →</Link>
          </span>
        </div>
      </div>

      <style jsx>{`
        .errx {
          background: var(--ins-paper);
          color: var(--ins-ink);
          font-family: var(--ins-font);
          min-height: 70dvh;
          display: flex;
          align-items: center;
        }
        .errx__page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 48px 40px;
        }
        .errx__kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .errx__display {
          margin: 18px 0 0;
          max-width: 16ch;
          font-size: clamp(34px, 5.6vw, 64px);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1;
        }
        .errx__dek {
          margin: 20px 0 0;
          max-width: 60ch;
          font-size: 17px;
          font-weight: 500;
          line-height: 1.55;
          color: var(--ins-gray-700);
          text-wrap: pretty;
        }
        .errx__ref {
          margin: 22px 0 0;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          font-variant-numeric: tabular-nums;
        }
        .errx__digest {
          color: var(--ins-ink);
        }
        .errx__actions {
          margin-top: 30px;
          padding-top: 22px;
          border-top: 1px solid var(--ins-ink);
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
        }
        .errx__try {
          appearance: none;
          border: 0;
          border-radius: 0;
          background: var(--ins-signal);
          color: #ffffff;
          font-family: var(--ins-font);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 15px 30px;
          min-height: 46px;
          cursor: pointer;
          transition: background 0.18s ease;
        }
        .errx__try:hover {
          background: #c8331f;
        }
        .errx__try:focus-visible {
          outline: 2px solid var(--ins-ink);
          outline-offset: 3px;
        }
        /* styled-jsx puts no scope class on <Link>; the wrapper carries it
           and reaches the rendered anchor with :global(). */
        .errx__home :global(a) {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-ink);
          text-decoration: none;
          border-bottom: 2px solid var(--ins-ink);
          padding-bottom: 5px;
          white-space: nowrap;
        }
        .errx__home :global(a:hover) {
          color: var(--ins-signal);
          border-bottom-color: var(--ins-signal);
        }

        @media (max-width: 640px) {
          .errx__page {
            padding: 32px 20px;
          }
          .errx__kicker {
            font-size: 8.5px;
            letter-spacing: 0.22em;
          }
          .errx__display {
            margin-top: 12px;
            max-width: none;
            letter-spacing: -0.03em;
            line-height: 1.02;
          }
          .errx__dek {
            margin-top: 14px;
            font-size: 15px;
          }
          .errx__actions {
            margin-top: 24px;
            padding-top: 18px;
            gap: 18px;
          }
          .errx__try {
            width: 100%;
            padding: 15px 20px;
            font-size: 10px;
            letter-spacing: 0.14em;
          }
          .errx__home :global(a) {
            min-height: 44px;
            line-height: 42px;
            font-size: 10px;
            letter-spacing: 0.14em;
            padding-bottom: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .errx__try {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
