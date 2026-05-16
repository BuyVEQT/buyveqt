"use client";

import { useEffect, useRef, useState } from "react";
import type { NewPin } from "@/lib/usePinnedScenarios";

interface PinScenarioButtonProps {
  /** Required for the parent to actually persist the pin. When absent
   *  (parent isn't supplying onPin) the button hides entirely. */
  onPin?: (input: NewPin) => void;
  /** A function called at click time to build the pin payload from the
   *  calc's *current* state. Build-on-click avoids stale closures and
   *  keeps every calc's pin in sync with its inputs. */
  build: () => NewPin;
}

/**
 * Small "Pin scenario" button rendered alongside Share Results in each
 * calc. Provides ephemeral "Pinned" feedback without a toast system.
 */
export default function PinScenarioButton({
  onPin,
  build,
}: PinScenarioButtonProps) {
  const [justPinned, setJustPinned] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!onPin) return null;

  return (
    <button
      type="button"
      onClick={() => {
        onPin(build());
        setJustPinned(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setJustPinned(false), 1400);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-base)] transition-colors"
      aria-live="polite"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={justPinned ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {justPinned ? "Pinned" : "Pin scenario"}
    </button>
  );
}
