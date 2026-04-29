"use client";

import { useEffect, useRef, useState } from "react";
import {
  HISTORY,
  dateProgress,
  priceProgress,
  priceAtProgress,
  nearestAnchor,
  JOURNEY_CAPTIONS,
} from "@/lib/veqt-history";

const CHART_W = 1920;
const CHART_H = 600;
const PAD_TOP = 80;
const PAD_BOTTOM = 100;
const PAD_X = 40;

function fmtCAD(v: number): string {
  return v.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  });
}

function pricePathD(): string {
  const usableW = CHART_W - PAD_X * 2;
  const usableH = CHART_H - PAD_TOP - PAD_BOTTOM;
  return HISTORY.series
    .map((pt, i) => {
      const x = PAD_X + dateProgress(pt.d) * usableW;
      const y = PAD_TOP + (1 - priceProgress(pt.p)) * usableH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function priceAreaD(): string {
  const path = pricePathD();
  const usableW = CHART_W - PAD_X * 2;
  const lastX = PAD_X + usableW;
  const baseY = CHART_H - PAD_BOTTOM;
  return `${path} L${lastX.toFixed(1)},${baseY.toFixed(1)} L${PAD_X.toFixed(1)},${baseY.toFixed(1)} Z`;
}

/**
 * Read the user's vertical scroll progress through this section
 * (0..1) and translate the SVG horizontally so the timeline sweeps
 * left-to-right. On screens narrower than `lg` the sticky behavior
 * is disabled and the static fallback (in HistoryStaticFallback)
 * takes over.
 */
export default function HistoryHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [enabled, setEnabled] = useState(false);

  // Cache derived data across renders
  const path = pricePathD();
  const area = priceAreaD();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    function onScroll() {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const p = Math.min(1, Math.max(0, scrolled / Math.max(1, total)));
      setProgress(p);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  // The SVG is wider than the viewport at desktop widths. Translate
  // the inner <g> proportionally to scroll progress so the timeline
  // moves left-to-right. Translation distance is the difference
  // between the viewbox width and a "viewport" assumed to be the
  // user's actual window width — but since the SVG scales, we just
  // animate from 0 to -(CHART_W - viewportSweepW), where the sweep
  // width is something like 70% of the chart so the user sees the
  // full path swept across.
  const sweepRatio = 0.6;
  const tx = -progress * CHART_W * sweepRatio;

  // Current price interpolated from progress
  const currentPrice = priceAtProgress(progress);
  const currentValue = (10000 * currentPrice) / HISTORY.launchPrice;
  const anchor = nearestAnchor(progress);
  const caption = JOURNEY_CAPTIONS[anchor.id] ?? "";

  return (
    <section
      ref={sectionRef}
      className="hidden lg:block relative"
      style={{ height: "300vh" }}
      aria-label="Seven years of VEQT — scroll-locked timeline"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute top-8 left-0 right-0 px-12">
          <p className="bs-stamp" style={{ color: "var(--stamp)" }}>
            /history
          </p>
          <h1
            className="bs-display text-[2.5rem] xl:text-[3.5rem] leading-[1] mt-2"
            style={{ color: "var(--ink)" }}
          >
            Seven years of one ticker.
          </h1>
        </div>

        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
          aria-hidden
        >
          <g transform={`translate(${tx.toFixed(1)} 0)`}>
            {/* Filled area under the price line */}
            <path d={area} fill="var(--stamp)" opacity={0.06} />
            {/* Price line */}
            <path
              d={path}
              stroke="var(--stamp)"
              strokeWidth={2}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Anchor markers + annotations */}
            {HISTORY.anchors.map((a) => {
              const usableW = CHART_W - PAD_X * 2;
              const usableH = CHART_H - PAD_TOP - PAD_BOTTOM;
              const x = PAD_X + dateProgress(a.date) * usableW;
              const y = PAD_TOP + (1 - priceProgress(a.price)) * usableH;

              const anchorProgress = dateProgress(a.date);
              const dist = Math.abs(progress - anchorProgress);
              const opacity = Math.max(0, 1 - dist * 6);

              return (
                <g key={a.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={a.id === "today" ? 5.5 : 4}
                    fill="var(--stamp)"
                    stroke={a.id === "today" ? "var(--ink)" : "none"}
                    strokeWidth={a.id === "today" ? 1.5 : 0}
                  />
                  {/* Year axis tick */}
                  <line
                    x1={x}
                    y1={CHART_H - PAD_BOTTOM}
                    x2={x}
                    y2={CHART_H - PAD_BOTTOM + 12}
                    stroke="var(--rule)"
                    strokeWidth={0.75}
                  />
                  <text
                    x={x}
                    y={CHART_H - PAD_BOTTOM + 30}
                    textAnchor="middle"
                    fill="var(--ink-mute)"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 14,
                    }}
                  >
                    {a.date.slice(0, 7)}
                  </text>

                  {/* Annotation block */}
                  <g
                    transform={`translate(${x} ${y - 24})`}
                    opacity={opacity}
                  >
                    <text
                      textAnchor="middle"
                      y={-32}
                      fill="var(--ink)"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 24,
                        fontWeight: 600,
                      }}
                    >
                      ${a.price.toFixed(2)}
                    </text>
                    <text
                      textAnchor="middle"
                      y={-12}
                      fill={a.drawdown !== null ? "var(--stamp)" : "var(--ink-mute)"}
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontStyle: "italic",
                        fontSize: 13,
                      }}
                    >
                      {a.label}
                      {a.drawdown !== null && ` · ${(a.drawdown * 100).toFixed(0)}%`}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Investment journey strip — fixed at the bottom of the
            sticky viewport, NOT inside the translated SVG group. */}
        <div className="absolute bottom-10 left-0 right-0 px-12">
          <div className="border-t-2 border-[color:var(--ink)] pt-4 flex items-baseline gap-3 flex-wrap">
            <span className="bs-label">$10K at launch</span>
            <span style={{ color: "var(--ink-mute)" }}>→</span>
            <span
              className="text-[2.25rem] sm:text-[2.5rem] tabular-nums leading-none"
              style={{
                color: "var(--stamp)",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
              }}
            >
              {fmtCAD(currentValue)}
            </span>
          </div>
          <p
            className="bs-body italic mt-2 text-[0.9375rem] sm:text-[1rem] max-w-[64ch]"
            style={{ color: "var(--ink-soft)" }}
          >
            {caption}
          </p>
        </div>
      </div>
    </section>
  );
}
