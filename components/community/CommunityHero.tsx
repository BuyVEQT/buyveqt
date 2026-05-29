"use client";

import { useEffect, useRef, useState } from "react";
import type { SubredditStats } from "@/lib/data/reddit";

/* ── Tiny count-up tween (no external dep) ────────────────────── */
function useCountUp(target: number | null | undefined, duration = 1200): number {
  const [v, setV] = useState(0);
  const startRef = useRef<{ value: number; time: number }>({ value: 0, time: 0 });

  useEffect(() => {
    const goal = target ?? 0;
    const sv = startRef.current.value;
    if (sv === goal) return;
    const st = performance.now();
    let frame: number;
    const step = (now: number) => {
      const t = Math.min(1, (now - st) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const next = sv + (goal - sv) * eased;
      setV(next);
      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else {
        startRef.current.value = goal;
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return v;
}

interface PulseStatProps {
  label: string;
  value: number | null | undefined;
  icon: string;
  tone?: "live" | "default";
  /**
   * If true, render `—` instead of "0" when the value is missing or
   * exactly 0. Use for stats where a literal 0 is a fluke of timing
   * (e.g. "Online now" is genuinely 0 between active users) rather
   * than a meaningful zero. Stats like "Top post score" and "Avg
   * replies" stay at "0" since 0 there is real data.
   */
  emptyAsDash?: boolean;
}

function PulseStat({
  label,
  value,
  icon,
  tone = "default",
  emptyAsDash = false,
}: PulseStatProps) {
  const animated = useCountUp(value);
  const isLive = tone === "live";
  const iconColor = isLive ? "var(--stamp)" : "var(--ink)";
  const isEmpty = value == null || value === 0;
  const display = emptyAsDash && isEmpty
    ? "—"
    : Math.round(animated).toLocaleString("en-CA");
  return (
    <div className="ps">
      <div className="ed-label ps__label">
        {isLive && <span className="ps__dot" aria-hidden />}
        {label}
      </div>
      <div className="ps__row">
        <span className="ps__icon" aria-hidden style={{ color: iconColor }}>
          {icon}
        </span>
        <span className="ed-display ed-numerals ps__val">
          {display}
        </span>
      </div>

      <style jsx>{`
        .ps {
          display: flex;
          flex-direction: column;
        }
        .ps__label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .ps__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--stamp);
          animation: ps-pulse 2.4s ease-in-out infinite;
        }
        @keyframes ps-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .ps__row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: 6px;
        }
        .ps__icon {
          font-size: 18px;
          line-height: 1;
        }
        .ps__val {
          font-size: clamp(1.6rem, 2.6vw, 2rem);
          line-height: 1;
          letter-spacing: -0.02em;
          color: var(--ink);
        }
      `}</style>
    </div>
  );
}

interface CommunityHeroProps {
  stats: SubredditStats | null;
}

/**
 * V2 community masthead.
 *
 * Live numbers come from two sources: the server-rendered `stats` prop
 * (best-effort; can be zeros if Vercel's Node serverless render fails
 * to reach the Cloudflare proxy at SSR time) and a client-side refetch
 * of `/api/reddit` on mount. The Edge route at `/api/reddit` is the
 * only path proven to reliably reach the proxy from Vercel, which is
 * why the post feed below already hydrates this way — we mirror the
 * pattern here so Members / Top post / Avg replies always end up live
 * regardless of what Node SSR managed to fetch.
 */
export default function CommunityHero({ stats }: CommunityHeroProps) {
  // Resolve the date client-side post-mount so SSR (which may have been cached
  // hours/days ago) doesn't hydration-mismatch against the live client.
  const [dateStr, setDateStr] = useState<string>("");
  useEffect(() => {
    setDateStr(
      new Intl.DateTimeFormat("en-CA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date())
    );
  }, []);

  // Start from the server-rendered stats, then swap to live data on
  // mount via the working Edge route. /api/reddit returns enriched
  // stats (subscribers, activeUsers, topPostScore, avgComments) so we
  // populate every number from one network call.
  const [liveStats, setLiveStats] = useState<SubredditStats | null>(stats);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/reddit")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.stats) return;
        setLiveStats(data.stats as SubredditStats);
      })
      .catch(() => {
        // Swallowed by design — server stats remain in place. The
        // Edge route logs its own errors, no need to double-log here.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const subscribersTarget = liveStats?.subscribers ?? 0;
  const subscribers = useCountUp(subscribersTarget);

  const activeUsers = liveStats?.activeUsers ?? null;
  const topPostScore = liveStats?.topPostScore ?? null;
  const avgComments = liveStats?.avgComments ?? null;

  // Only show pulse stats we actually have. On the RSS fallback (no scores,
  // comments, or subscriber count) these are all empty, so the strip hides
  // entirely rather than rendering a row of dashes.
  const pulseStats: {
    label: string;
    value: number;
    icon: string;
    tone?: "live" | "default";
  }[] = [
    { label: "Online now", value: activeUsers ?? 0, icon: "•", tone: "live" as const },
    { label: "Top post score", value: topPostScore ?? 0, icon: "▲" },
    { label: "Avg replies", value: avgComments ?? 0, icon: "↳" },
  ].filter((s) => s.value > 0);

  return (
    <header className="cm-hero">
      {/* Top stamp row */}
      <div className="cm-hero__top">
        <span className="ed-stamp">The forum · r/JustBuyVEQT · Live</span>
        <span className="ed-stamp" style={{ color: "var(--ink-mute)" }}>
          {dateStr}
        </span>
      </div>
      <div className="rule-thick" />

      {/* Title lockup */}
      <div className="cm-hero__title">
        <div className="cm-hero__title-lockup">
          <span className="ed-stamp" style={{ color: "var(--ink-mute)" }}>
            Letters from
          </span>
          <h1 className="ed-display-italic cm-hero__h1">
            the{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>holders.</em>
          </h1>
        </div>
        {subscribersTarget > 0 && (
          <div className="cm-hero__count">
            <span className="ed-stamp cm-hero__count-label">Members</span>
            <span className="ed-display ed-numerals cm-hero__count-num">
              {Math.round(subscribers).toLocaleString("en-CA")}
            </span>
            <span className="ed-caption cm-hero__count-cap">
              Canadians holding each other accountable.
            </span>
          </div>
        )}
      </div>

      {/* Lede */}
      <p className="ed-body cm-hero__lede">
        Real questions, real milestones, the occasional panic, the occasional
        victory. Pulled from{" "}
        <a
          href="https://www.reddit.com/r/JustBuyVEQT/"
          target="_blank"
          rel="noopener noreferrer"
          className="cm-hero__lede-link"
        >
          r/JustBuyVEQT
        </a>{" "}
        every thirty minutes. Bring your real numbers and your bad takes —
        you&apos;ll get honesty back.
      </p>

      {/* Pulse strip — subscribers/scores/comments come from Reddit's JSON
          API. On the RSS fallback they're all unavailable, so we render only
          the stats we actually have, and hide the strip entirely when there
          are none, rather than showing a row of dashes. */}
      {pulseStats.length > 0 && (
        <div
          className={`cm-hero__pulse ${
            pulseStats.length >= 3 ? "is-three" : "is-two"
          }`}
        >
          {pulseStats.map((s) => (
            <PulseStat
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              tone={s.tone}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .cm-hero {
          padding: 26px 0 18px;
        }
        .cm-hero__top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-bottom: 10px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .cm-hero__title {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          padding: 22px 0 8px;
          align-items: end;
        }
        @media (min-width: 760px) {
          .cm-hero__title {
            grid-template-columns: 1.4fr 1fr;
            gap: 40px;
          }
        }
        .cm-hero__title-lockup {
          display: flex;
          flex-direction: column;
        }
        .cm-hero__h1 {
          font-size: clamp(2.6rem, 6vw, 4.6rem);
          line-height: 1;
          letter-spacing: -0.035em;
          margin: 6px 0 0;
          color: var(--ink);
        }
        .cm-hero__count {
          padding: 18px 22px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-radius: 22px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cm-hero__count-label {
          color: var(--ink-mute);
        }
        .cm-hero__count-num {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          line-height: 0.95;
          letter-spacing: -0.025em;
          color: var(--ink);
        }
        .cm-hero__count-cap {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 12px;
          color: var(--ink-soft);
        }
        .cm-hero__lede {
          margin: 22px 0 0;
          font-size: clamp(15px, 1.6vw, 17px);
          line-height: 1.55;
          color: var(--ink-soft);
          max-width: 64ch;
        }
        .cm-hero__lede-link {
          color: var(--stamp);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .cm-hero__pulse {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid var(--rule-soft);
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 720px) {
          .cm-hero__pulse.is-four {
            grid-template-columns: repeat(4, 1fr);
            gap: 28px;
          }
          .cm-hero__pulse.is-three {
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
          }
        }
      `}</style>
    </header>
  );
}
