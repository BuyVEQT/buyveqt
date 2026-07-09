"use client";

import { useEffect, useRef, useState } from "react";
import type { Region } from "@/lib/useRegions";
import SectionLabel from "@/components/ui/SectionLabel";
import RegionCard from "./RegionCard";

interface RegionCarouselProps {
  regions: Region[];
  leaderIndex: number;
}

/**
 * Mobile horizontal scroll-snap row of region cards. Page-dot indicator
 * tracks the active card on scroll.
 */
export default function RegionCarousel({ regions, leaderIndex }: RegionCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const cardWidth = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 232;
      const gap = 12;
      const idx = Math.round(el.scrollLeft / (cardWidth + gap));
      setActiveIdx(Math.max(0, Math.min(regions.length - 1, idx)));
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [regions.length]);

  if (regions.length === 0) {
    return (
      <div style={{ padding: "0 14px" }}>
        <SectionLabel>Today&apos;s move</SectionLabel>
        <div
          style={{ display: "flex", gap: 12, marginTop: 12, overflow: "hidden" }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ width: 232, height: 220, borderRadius: 18, flexShrink: 0 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          padding: "0 14px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div>
          <SectionLabel>Today&apos;s move</SectionLabel>
          <div
            className="ed-display"
            style={{ fontSize: 22, marginTop: 4, letterSpacing: "-0.015em" }}
          >
            Where it came from
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            color: "var(--ink-mute)",
            fontWeight: 600,
          }}
        >
          Swipe →
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="ed-snap-row"
        style={{ padding: "4px 14px" }}
      >
        {regions.map((r, i) => (
          <RegionCard key={r.ticker} region={r} width={232} leader={i === leaderIndex} />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginTop: 14,
        }}
        aria-hidden
      >
        {regions.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === activeIdx ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background: i === activeIdx ? "var(--ink)" : "var(--rule-soft)",
              transition: "width 0.2s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
