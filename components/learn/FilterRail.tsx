"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const CATEGORY_FILTERS = [
  { key: "all", label: "All" },
  { key: "beginner", label: "Basics" },
  { key: "comparison", label: "Comparisons" },
  { key: "tax-strategy", label: "Tax & Accounts" },
  { key: "veqt-deep-dive", label: "Deep Dive" },
] as const;

const DIFFICULTY_FILTERS = [
  { key: "all", label: "All levels" },
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
] as const;

const TIME_FILTERS = [
  { key: "all", label: "Any length" },
  { key: "quick", label: "Quick (<8m)" },
  { key: "standard", label: "Standard (8–11m)" },
  { key: "long", label: "Long (12m+)" },
] as const;

export default function FilterRail() {
  const router = useRouter();
  const params = useSearchParams();
  const [moreOpen, setMoreOpen] = useState(false);

  const cat = params.get("cat") ?? "all";
  const diff = params.get("diff") ?? "all";
  const time = params.get("time") ?? "all";
  const take = params.get("take") === "1";
  const search = params.get("q") ?? "";
  const tag = params.get("tag") ?? null;

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "all" || v === "") {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    }
    router.replace(`/learn?${next.toString()}`, { scroll: false });
  }

  const hasFilters = cat !== "all" || diff !== "all" || time !== "all" || take || !!search || !!tag;

  function clearAll() {
    router.replace("/learn", { scroll: false });
    setMoreOpen(false);
  }

  return (
    <div className="sticky top-0 z-20 -mx-5 sm:-mx-8 lg:-mx-12 px-5 sm:px-8 lg:px-12 py-3 bg-[var(--paper)]/95 backdrop-blur-[6px] border-b border-[var(--color-border)]">
      {/* Row 1: category chips + search */}
      <div className="flex items-center gap-3 sm:gap-5">
        <nav
          className="flex-1 flex items-center gap-4 sm:gap-6 overflow-x-auto hide-scrollbar bs-label"
          aria-label="Filter by category"
        >
          {CATEGORY_FILTERS.map((f) => {
            const active = cat === f.key && !tag;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => update({ cat: f.key, tag: null })}
                className="shrink-0 whitespace-nowrap transition-colors"
                style={{
                  color: active ? "var(--stamp)" : "var(--ink-soft)",
                  textDecoration: active ? "underline" : "none",
                  textUnderlineOffset: "4px",
                }}
              >
                {f.label}
              </button>
            );
          })}
          {tag && (
            <button
              type="button"
              onClick={() => update({ tag: null })}
              className="shrink-0 whitespace-nowrap transition-colors"
              style={{
                color: "var(--stamp)",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
              }}
            >
              #{tag} ×
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile "More filters" toggle */}
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className="sm:hidden bs-label transition-colors"
            style={{ color: moreOpen ? "var(--stamp)" : "var(--ink-soft)" }}
            aria-expanded={moreOpen}
          >
            {moreOpen ? "Less" : "Filters"}
          </button>

          <label className="w-40 sm:w-56">
            <span className="sr-only">Search</span>
            <input
              type="search"
              value={search}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Search…"
              className="w-full bg-transparent border-b border-[var(--ink)]/40 focus:border-[var(--stamp)] outline-none text-sm py-1"
              style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
            />
          </label>
        </div>
      </div>

      {/* Row 2: difficulty, time, Our Take — always visible on desktop, collapsed on mobile */}
      <div
        className={[
          "mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 bs-label",
          moreOpen ? "flex" : "hidden sm:flex",
        ].join(" ")}
      >
        {/* Difficulty */}
        <div className="flex items-center gap-3">
          <span style={{ color: "var(--ink-soft)", fontSize: "11px" }}>Level:</span>
          {DIFFICULTY_FILTERS.map((f) => {
            const active = diff === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => update({ diff: f.key })}
                className="shrink-0 whitespace-nowrap transition-colors"
                style={{
                  color: active ? "var(--stamp)" : "var(--ink-soft)",
                  textDecoration: active ? "underline" : "none",
                  textUnderlineOffset: "4px",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <span className="opacity-30" style={{ color: "var(--ink-soft)" }}>|</span>

        {/* Time */}
        <div className="flex items-center gap-3">
          <span style={{ color: "var(--ink-soft)", fontSize: "11px" }}>Time:</span>
          {TIME_FILTERS.map((f) => {
            const active = time === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => update({ time: f.key })}
                className="shrink-0 whitespace-nowrap transition-colors"
                style={{
                  color: active ? "var(--stamp)" : "var(--ink-soft)",
                  textDecoration: active ? "underline" : "none",
                  textUnderlineOffset: "4px",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <span className="opacity-30" style={{ color: "var(--ink-soft)" }}>|</span>

        {/* Our Take toggle */}
        <button
          type="button"
          onClick={() => update({ take: take ? null : "1" })}
          className="shrink-0 whitespace-nowrap bs-stamp transition-colors"
          style={{
            fontSize: "11px",
            color: take ? "var(--stamp)" : "var(--ink-soft)",
            textDecoration: take ? "underline" : "none",
            textUnderlineOffset: "4px",
          }}
        >
          {take ? "✓ Our Take" : "Our Take"}
        </button>

        {/* Clear all */}
        {hasFilters && (
          <>
            <span className="opacity-30" style={{ color: "var(--ink-soft)" }}>|</span>
            <button
              type="button"
              onClick={clearAll}
              className="bs-label transition-colors"
              style={{ color: "var(--ink-soft)", fontSize: "11px" }}
            >
              Clear all
            </button>
          </>
        )}
      </div>
    </div>
  );
}
