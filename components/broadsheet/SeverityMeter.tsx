"use client";

import type { SeverityReading } from "@/lib/severity";
import { severitySentence } from "@/lib/severity";

interface Props {
  reading: SeverityReading | null;
  loading: boolean;
  /**
   * When true: hides the inline legend, hides the prose sentence, and
   * halves the gauge height. Renders as an ~80px-tall horizontal strip:
   * gauge on top, current severity word + benchmark caption underneath.
   */
  compact?: boolean;
}

/**
 * "How unusual is today?" — a print-engraved severity strip.
 *
 * Three things distinguish this from xeqtbrief's equivalent:
 *
 *   1. Zone widths reflect *empirical* frequency since inception, so the
 *      reader literally sees how rare Unusual / Rare days are.
 *   2. A compact inline legend reports each zone's frequency with no
 *      alignment games — reads left-to-right regardless of zone width.
 *   3. The behavioural sentence underneath is keyed to the zone, so a
 *      holder gets a specific read of today rather than a template.
 */
export default function SeverityMeter({ reading, loading, compact = false }: Props) {
  if (loading || !reading) {
    return (
      <div
        className={
          compact
            ? "py-3 border-t border-b border-[var(--ink)]"
            : "mt-7 sm:mt-9 pt-5 border-t border-[var(--ink)]"
        }
      >
        <p className="bs-label">How unusual is today?</p>
        <div className={`mt-3 ${compact ? "h-[10px]" : "h-[22px]"} skeleton`} />
        {!compact && <div className="mt-2 h-3 w-3/4 skeleton" />}
      </div>
    );
  }

  const { markerPosition, zoneBoundaries, zoneFrequencies, typicalMovePercent, todayChangePercent } =
    reading;
  const [b1, b2, b3] = zoneBoundaries;
  const [fTypical, fNotable, fUnusual, fRare] = zoneFrequencies;
  const direction = todayChangePercent >= 0 ? "up" : "down";

  const widthTypical = b1;
  const widthNotable = b2 - b1;
  const widthUnusual = b3 - b2;
  const widthRare = 100 - b3;

  const fmtFreq = (f: number): string => {
    const pct = f * 100;
    if (pct >= 1) return `${pct.toFixed(0)}%`;
    return `<1%`;
  };

  const zones: {
    label: SeverityReading["zone"];
    width: number;
    frequency: number;
    shade: number;
  }[] = [
    { label: "Typical", width: widthTypical, frequency: fTypical, shade: 5 },
    { label: "Notable", width: widthNotable, frequency: fNotable, shade: 13 },
    { label: "Unusual", width: widthUnusual, frequency: fUnusual, shade: 24 },
    { label: "Rare", width: widthRare, frequency: fRare, shade: 38 },
  ];

  return (
    <div
      className={
        compact
          ? "py-3 border-t border-b border-[var(--ink)]"
          : "mt-7 sm:mt-9 pt-5 border-t border-[var(--ink)]"
      }
    >
      {/* Header row: label on the left, typical-day benchmark on the right */}
      <div className="flex items-baseline justify-between gap-3">
        <p className="bs-label">How unusual is today?</p>
        <p
          className="bs-caption italic text-[12px]"
          style={{ color: "var(--ink-soft)" }}
        >
          {compact ? (
            <>
              <span style={{ color: "var(--ink)" }}>{reading.zone} day</span>
              {" · "}
              typical ±{typicalMovePercent.toFixed(2)}%
            </>
          ) : (
            <>A typical session moves ±{typicalMovePercent.toFixed(2)}%.</>
          )}
        </p>
      </div>

      {/* Marker callout — "Typical day" etc. floats above the marker so the
          reader sees both their location and what it's called, without
          stuffing four labels onto a strip where zones are asymmetric.
          In compact mode, the zone word moves to the header row to save
          vertical space. */}
      {!compact && (
        <div className="relative mt-4 h-5">
          <span
            className="absolute -translate-x-1/2 bs-label whitespace-nowrap"
            style={{
              left: `${Math.max(8, Math.min(92, markerPosition))}%`,
              color: "var(--stamp)",
            }}
          >
            {reading.zone} day
          </span>
        </div>
      )}

      {/* The strip itself */}
      <div
        className={`relative ${compact ? "h-[10px] mt-2" : "h-[20px]"} overflow-hidden`}
        style={{
          backgroundColor: "color-mix(in oklab, var(--ink) 4%, transparent)",
        }}
        role="img"
        aria-label={`Severity meter. Today is a ${reading.zone.toLowerCase()} day.`}
      >
        {/* Zone backgrounds — progressively darker cream to hint at rarity */}
        {zones.map((z, i) => {
          const left = zones.slice(0, i).reduce((s, zz) => s + zz.width, 0);
          return (
            <div
              key={z.label}
              className="absolute top-0 bottom-0"
              style={{
                left: `${left}%`,
                width: `${z.width}%`,
                backgroundColor: `color-mix(in oklab, var(--ink) ${z.shade}%, transparent)`,
              }}
              aria-hidden
            />
          );
        })}

        {/* Hatching overlay — matches SectorBars */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, color-mix(in oklab, var(--paper) 28%, transparent) 0 1px, transparent 1px 7px)",
          }}
        />

        {/* Zone tick marks at each empirical σ boundary */}
        {[b1, b2, b3].map((pos, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${pos}%`, backgroundColor: "var(--ink)" }}
          />
        ))}

        {/* Marker — vermilion disc with a small directional caret */}
        <span
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center"
          style={{
            left: `${markerPosition}%`,
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "var(--stamp)",
            boxShadow: "0 0 0 2px var(--paper)",
          }}
        >
          <span
            style={{
              color: "var(--paper)",
              fontSize: 8,
              lineHeight: 1,
              fontFamily: "var(--font-display)",
              transform:
                direction === "up" ? "translateY(-0.5px)" : "translateY(0.5px)",
            }}
          >
            {direction === "up" ? "▲" : "▼"}
          </span>
        </span>
      </div>

      {/* Inline legend — reads left-to-right, no alignment games. Active zone
          is rendered in full ink, others fade. This is how the reader learns
          which zone is which, without per-zone labels overlapping. */}
      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 bs-label">
          {zones.map((z) => {
            const active = z.label === reading.zone;
            return (
              <span
                key={z.label}
                style={{
                  color: active ? "var(--ink)" : "var(--ink-soft)",
                  opacity: active ? 1 : 0.75,
                }}
              >
                <span
                  aria-hidden
                  className="inline-block w-[8px] h-[8px] mr-[0.45em] align-middle"
                  style={{
                    backgroundColor: `color-mix(in oklab, var(--ink) ${z.shade + 8}%, transparent)`,
                    borderRadius: 1,
                  }}
                />
                {z.label}{" "}
                <span
                  className="opacity-70"
                  style={{ fontFeatureSettings: "'tnum' 1" }}
                >
                  {fmtFreq(z.frequency)} of days
                </span>
              </span>
            );
          })}
        </div>
      )}

      {/* Editorial sentence — the behavioural anchor */}
      {!compact && (
        <p
          className="bs-body mt-5 text-[15px] sm:text-[16px] leading-[1.55] max-w-[58ch]"
          style={{ color: "var(--ink)" }}
        >
          {severitySentence(reading)}
        </p>
      )}
    </div>
  );
}
