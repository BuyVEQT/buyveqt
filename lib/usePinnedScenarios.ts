/**
 * Pinned scenarios — small localStorage-backed bookmarks of "input set
 * + headline number" so a reader can compare what-if branches without
 * losing the current state of the calc when they tweak an input.
 *
 * The scenario object carries the same `tab + params` shape as
 * `Handoff`, so "load" can reuse the existing CalculatorTabs handoff
 * pipeline (URL replaceState + tab switch + destination calc reads URL
 * on mount). No new restore plumbing.
 *
 * Stored in localStorage under a versioned key. Cap of 8 pins keeps
 * the compare bar readable and storage trivially small.
 */
"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "buyveqt:pinned-scenarios:v1";
const MAX_PINS = 8;

export interface PinnedScenario {
  /** Stable id — used for delete + React keys. */
  id: string;
  /** ms timestamp; pins render newest-first. */
  pinnedAt: number;
  /** Calc tab id (matches CalculatorTabs TABS[].id). */
  tab: string;
  /** Calc-name badge for the pin chip ("DCA", "FIRE", etc.). */
  tabLabel: string;
  /** Compact input summary ("$500/mo @ 8% × 20yr"). */
  label: string;
  /** The single headline number for this scenario ("$294,510"). */
  highlight: string;
  /** Long-key params; passed to onHandoff to restore the scenario. */
  params: Record<string, string | number>;
}

export type NewPin = Omit<PinnedScenario, "id" | "pinnedAt">;

function safeParse(raw: string | null): PinnedScenario[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p) =>
        typeof p === "object" &&
        p !== null &&
        typeof p.id === "string" &&
        typeof p.tab === "string"
    );
  } catch {
    return [];
  }
}

function genId(): string {
  // crypto.randomUUID isn't always available (older browsers, some envs),
  // and we don't need cryptographic uniqueness — just collision-free for
  // a list of <10 items.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function usePinnedScenarios() {
  const [scenarios, setScenarios] = useState<PinnedScenario[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount — render empty on SSR/first
  // client paint to avoid hydration mismatch.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setScenarios(safeParse(window.localStorage.getItem(STORAGE_KEY)));
    setHydrated(true);

    // Cross-tab sync: another tab pinning/unpinning updates this tab.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setScenarios(safeParse(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: PinnedScenario[]) => {
    setScenarios(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const pin = useCallback(
    (input: NewPin) => {
      const newPin: PinnedScenario = {
        ...input,
        id: genId(),
        pinnedAt: Date.now(),
      };
      // Newest first; cap at MAX_PINS by dropping oldest.
      const next = [newPin, ...scenarios].slice(0, MAX_PINS);
      persist(next);
    },
    [scenarios, persist]
  );

  const unpin = useCallback(
    (id: string) => {
      persist(scenarios.filter((s) => s.id !== id));
    },
    [scenarios, persist]
  );

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  return {
    scenarios,
    hydrated,
    pin,
    unpin,
    clear,
    /** True when adding another pin would drop the oldest. */
    isFull: scenarios.length >= MAX_PINS,
  };
}
