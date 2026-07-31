"use client";

import { useSyncExternalStore } from "react";
import { fmtPrice } from "@/lib/instrument-format";
import { getCached, setCache } from "@/lib/cache";

interface LiveTickerPillProps {
  /** Compact = mobile top bar (smaller dot + type). Full = desktop nav. */
  compact?: boolean;
}

/* ── Price-only store ─────────────────────────────────────────
 *
 * The pill prints exactly one number, so it reads `/api/quote` (a few
 * hundred bytes) rather than `/api/veqt?period=1Y`, which shipped ~10 KB of
 * daily history the pill threw away.
 *
 * Two pills mount on every page — DesktopNav and TopBar — and the store
 * below makes that one request and one timer between them: latecomers share
 * the in-flight promise, a price younger than REFRESH_MS is served from
 * memory, and the interval starts with the first mount and is cleared when
 * the last one unmounts. Polling pauses while the tab is hidden and resumes
 * with a catch-up fetch.
 */

const REFRESH_MS = 5 * 60 * 1000;
/** localStorage key for the outage fallback — same store the rest of the
 *  client data layer uses (1h max age, enforced by lib/cache). */
const CACHE_KEY = "quote:VEQT";

/** Only the field the pill renders — the route returns the full QuoteData. */
interface QuotePayload {
  price?: number;
}

let price: number | null = null;
/** Epoch ms of the last SUCCESSFUL fetch. 0 = never succeeded. */
let fetchedAt = 0;
let inFlight: Promise<void> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let visibilityBound = false;
const listeners = new Set<() => void>();

function publish(next: number | null): void {
  if (next === price) return;
  price = next;
  listeners.forEach((listener) => listener());
}

function load(): Promise<void> {
  if (inFlight) return inFlight;

  const run = (async () => {
    try {
      const res = await fetch("/api/quote?symbol=VEQT");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: QuotePayload = await res.json();
      if (typeof json.price === "number" && Number.isFinite(json.price)) {
        fetchedAt = Date.now();
        setCache(CACHE_KEY, json.price);
        publish(json.price);
      }
    } catch {
      // Swallowed by design. On an initial-load failure fall back to the
      // last price this browser saw (same behaviour the hook this replaced
      // had); on a background-refresh failure keep the live price rather
      // than regressing it to cache.
      if (price === null) {
        const cached = getCached<number>(CACHE_KEY);
        if (typeof cached === "number") publish(cached);
      }
    } finally {
      inFlight = null;
    }
  })();

  inFlight = run;
  return run;
}

function ensureFresh(): void {
  if (inFlight) return;
  if (price !== null && Date.now() - fetchedAt < REFRESH_MS) return;
  void load();
}

function startPolling(): void {
  if (timer !== null || listeners.size === 0) return;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    return;
  }
  timer = setInterval(() => {
    void load();
  }, REFRESH_MS);
}

function stopPolling(): void {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

function onVisibilityChange(): void {
  if (document.visibilityState === "hidden") {
    stopPolling();
    return;
  }
  if (listeners.size === 0) return;
  // Freshness-checked, not unconditional — rapid visibility flips
  // (webviews, automation, app switches) must not each cost a fetch.
  ensureFresh();
  startPolling();
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  if (!visibilityBound && typeof document !== "undefined") {
    visibilityBound = true;
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  ensureFresh();
  startPolling();

  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0) {
      stopPolling();
      if (visibilityBound) {
        visibilityBound = false;
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    }
  };
}

function getSnapshot(): number | null {
  return price;
}

function getServerSnapshot(): number | null {
  return null;
}

/**
 * Live ticker — Instrument grammar: "51.87 LIVE" with a pulsing 7px red
 * dot. No pill chrome, no border radius, ink on paper. Single source of
 * truth for the price chrome that appears on every page.
 *
 * Reads the shared price store above client-side; pre-allocates space for a
 * skeleton so first-paint doesn't shift the bar layout.
 */
export default function LiveTickerPill({ compact = false }: LiveTickerPillProps) {
  const livePrice = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const dotSize = compact ? 6 : 7;

  if (livePrice === null) {
    return (
      <span
        aria-hidden
        className="ins-shell"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: compact ? 7 : 8,
          minWidth: compact ? 64 : 72,
          height: compact ? 14 : 15,
        }}
      >
        <span
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: 999,
            background: "var(--ins-hair)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            flex: 1,
            height: 9,
            background: "var(--ins-track-soft)",
          }}
        />
      </span>
    );
  }

  return (
    <span
      className="ins-shell"
      aria-label={`VEQT.TO ${fmtPrice(livePrice)}, live`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 7 : 8,
        fontFamily: "var(--ins-font)",
        fontSize: compact ? 10.5 : 11,
        fontWeight: 700,
        color: "var(--ins-ink)",
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: 999,
          background: "var(--ins-signal)",
          animation: "ins-pulse 2.2s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      {fmtPrice(livePrice)} LIVE
    </span>
  );
}
