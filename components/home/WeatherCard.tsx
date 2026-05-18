"use client";

import Link from "next/link";
import type { SeverityReading } from "@/lib/severity";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";
import SeverityRing from "@/components/charts/SeverityRing";

interface WeatherCardProps {
  reading: SeverityReading | null;
  loading: boolean;
}

function zoneHeadline(reading: SeverityReading | null): string {
  if (!reading) return "Reading the tape…";
  const { zone, todayChangePercent } = reading;
  const dir = todayChangePercent >= 0 ? "rally" : "chop";
  switch (zone) {
    case "Typical":
      return `Below average ${dir}.`;
    case "Notable":
      return `Above average ${dir}.`;
    case "Unusual":
      return `An unusual ${todayChangePercent >= 0 ? "up day" : "down day"}.`;
    case "Rare":
      return `A rare ${todayChangePercent >= 0 ? "up day" : "down day"}.`;
    default:
      return "An ordinary session.";
  }
}

function blurb(reading: SeverityReading | null): string {
  if (!reading) return "Computing the day's distribution from since-inception sessions.";
  const { percentileRank, sampleFromYear, zone } = reading;
  const pct = Math.round(percentileRank * 100);
  if (zone === "Typical")
    return `Quieter than ${100 - pct}% of all VEQT trading days since ${sampleFromYear}.`;
  if (zone === "Notable")
    return `Bigger than ${pct}% of sessions since ${sampleFromYear} — still inside the normal range.`;
  if (zone === "Unusual")
    return `Bigger than ${pct}% of sessions since ${sampleFromYear}. Worth noticing, not acting on.`;
  return `Bigger than ${pct}% of sessions since ${sampleFromYear} — a genuinely rare day.`;
}

/**
 * SeverityRing + one-sentence editorial blurb + CTA to the explainer.
 * Two-column on desktop (ring left, copy right); stacks on mobile.
 */
export default function WeatherCard({ reading, loading }: WeatherCardProps) {
  // SeverityRing uses a signed z: negative = down day (crash side),
  // positive = up day (rally side). Magnitude in sigma units.
  const signedZ = reading
    ? (reading.todayChangePercent >= 0 ? 1 : -1) * reading.sigmaRatio
    : 0;
  const label = reading?.zone === "Typical" ? "Calm" : reading?.zone ?? "—";
  // Route the CTA to a real explainer based on today's direction.
  // Down day → behavioral piece on drawdowns. Up day → structural piece on
  // why equity markets rise. Both exist in content/learn.
  const ctaHref =
    reading && reading.todayChangePercent < 0
      ? "/learn/veqt-is-down"
      : "/learn/why-stocks-go-up";
  const ctaLabel =
    reading && reading.todayChangePercent < 0
      ? "Read · what to do when it's down"
      : "Read · why stock markets go up";

  return (
    <Card>
      <SectionLabel>Today&apos;s weather</SectionLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "min-content 1fr",
          gap: 22,
          alignItems: "center",
          marginTop: 16,
        }}
        className="weather-grid"
      >
        <div style={{ flexShrink: 0 }}>
          {loading && !reading ? (
            <div
              className="skeleton"
              style={{ width: 168, height: 168, borderRadius: "50%" }}
            />
          ) : (
            <SeverityRing z={signedZ} label={label} size={168} />
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            className="ed-display-italic"
            style={{ fontSize: "clamp(1.35rem, 2.4vw, 1.7rem)", color: "var(--ink)" }}
          >
            {zoneHeadline(reading)}
          </div>
          <p
            className="ed-body"
            style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: "var(--ink-soft)" }}
          >
            {blurb(reading)}
          </p>
          <Link
            href={ctaHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              marginTop: 16,
              padding: "10px 14px",
              border: "1px solid var(--ink)",
              borderRadius: 12,
              color: "var(--ink)",
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              textDecoration: "none",
              maxWidth: 360,
            }}
          >
            <span>{ctaLabel}</span>
            <span aria-hidden style={{ color: "var(--stamp)" }}>→</span>
          </Link>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 560px) {
          .weather-grid {
            grid-template-columns: 1fr !important;
            justify-items: center;
            text-align: center;
          }
        }
      `}</style>
    </Card>
  );
}
