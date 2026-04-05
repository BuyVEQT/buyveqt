/**
 * CRA TFSA annual contribution limits by year.
 * Source: https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account
 * Updated annually — last updated for 2026.
 */
export const TFSA_ANNUAL_LIMITS: Record<number, number> = {
  2009: 5000,
  2010: 5000,
  2011: 5000,
  2012: 5000,
  2013: 5500,
  2014: 5500,
  2015: 10000,
  2016: 5500,
  2017: 5500,
  2018: 5500,
  2019: 6000,
  2020: 6000,
  2021: 6000,
  2022: 6000,
  2023: 6500,
  2024: 7000,
  2025: 7000,
  2026: 7000,
};

/** First year TFSAs existed */
const TFSA_START_YEAR = 2009;

/** Current year (for contribution room calculation) */
const CURRENT_YEAR = new Date().getFullYear();

/** Minimum age to open a TFSA */
const TFSA_ELIGIBLE_AGE = 18;

/**
 * Get the first year a person was eligible to contribute to a TFSA.
 * Eligibility begins the year they turn 18, or 2009 (whichever is later).
 */
export function getFirstEligibleYear(birthYear: number): number {
  const turnsEighteen = birthYear + TFSA_ELIGIBLE_AGE;
  return Math.max(TFSA_START_YEAR, turnsEighteen);
}

/**
 * Compute total cumulative TFSA contribution room from first eligible year
 * through the current year.
 */
export function getLifetimeLimit(birthYear: number): number {
  const firstYear = getFirstEligibleYear(birthYear);
  let total = 0;
  for (let year = firstYear; year <= CURRENT_YEAR; year++) {
    total += TFSA_ANNUAL_LIMITS[year] ?? 0;
  }
  return total;
}

/**
 * Compute remaining TFSA contribution room.
 * Returns { lifetimeLimit, remaining, isOverContributed }.
 *
 * Note: This is a simplified calculation. Real TFSA room also includes
 * re-contribution room from prior-year withdrawals, which we can't track.
 */
export function computeTFSARoom(birthYear: number, pastContributions: number) {
  const lifetimeLimit = getLifetimeLimit(birthYear);
  const remaining = Math.max(0, lifetimeLimit - pastContributions);
  const isOverContributed = pastContributions > lifetimeLimit;

  return {
    lifetimeLimit,
    remaining,
    usedPct: lifetimeLimit > 0
      ? Math.min(100, (pastContributions / lifetimeLimit) * 100)
      : 0,
    isOverContributed,
    firstEligibleYear: getFirstEligibleYear(birthYear),
    currentYearLimit: TFSA_ANNUAL_LIMITS[CURRENT_YEAR] ?? 7000,
  };
}
