/**
 * Cross-calculator handoffs — small CTAs that carry a calc's inputs into
 * the next-step calc. The natural FI workflow is:
 *
 *   DCA (how much I save) → TFSA/RRSP (in what account) → FIRE (when it
 *   buys me out)
 *
 * Each handoff produces a `Handoff` object with the destination tab and
 * a params object that the destination calc reads from URL on mount and
 * pre-fills its state with. Reuses the existing share-link URL plumbing
 * — no new persistence layer.
 *
 * The CalculatorTabs parent receives the handoff, writes the params to
 * `window.history.replaceState`, and switches the active tab. The
 * destination calc unmounts/remounts (each calc is conditionally
 * rendered), so its useEffect-on-mount picks up the URL params cleanly.
 */

export interface Handoff {
  /** Destination tab id (matches CalculatorTabs TABS[].id). */
  tab: string;
  /**
   * Long-key params, written verbatim to the URL so they round-trip
   * through expandParams() and inferTab() the same way share links do.
   */
  params: Record<string, string | number>;
  /** Button label for the CTA that triggers this handoff. */
  ctaLabel: string;
}

/**
 * DCA tab → TFSA/RRSP tab. The user just played with a monthly amount
 * over a horizon at some return rate; carry those into the Shelter so
 * they can ask "what does that look like inside a tax shelter?".
 *
 * Shelter uses an annual contribution (not monthly), so we multiply by
 * 12. Starting balance defaults to 0 — the user can adjust on arrival.
 */
export function dcaToShelter(input: {
  monthly: number;
  horizon: number;
  rate: number;
}): Handoff {
  return {
    tab: "tfsa-rrsp",
    params: {
      starting: 0,
      annual: Math.round(input.monthly * 12),
      horizon: input.horizon,
      rate: input.rate,
    },
    ctaLabel: "Plan this inside a TFSA or RRSP →",
  };
}

/**
 * TFSA/RRSP tab → FIRE tab. The Shelter's "starting balance" is the
 * user's current portfolio, which maps directly to FIRE's "current
 * portfolio". Annual contribution → monthly. Return rate carries.
 */
export function shelterToFire(input: {
  starting: number;
  annual: number;
  rate: number;
}): Handoff {
  return {
    tab: "fire",
    params: {
      portfolio: input.starting,
      monthly: Math.round(input.annual / 12),
      rate: input.rate,
    },
    ctaLabel: "See what this means for FIRE →",
  };
}

/**
 * Lookback DCA mode → DCA tab. Carry the monthly amount; convert the
 * backtest duration to a forward horizon (years), clamped to DCA's
 * 1–40 range. Return rate isn't carried — Lookback is historical so it
 * has no rate input; DCA's default 8% is sensible.
 */
export function lookbackDcaToDca(input: {
  amount: number;
  durationMonths: number;
}): Handoff {
  const years = Math.max(1, Math.min(40, Math.round(input.durationMonths / 12)));
  return {
    tab: "dca",
    params: {
      monthly: Math.round(input.amount),
      horizon: years,
    },
    ctaLabel: "Use these inputs going forward →",
  };
}
