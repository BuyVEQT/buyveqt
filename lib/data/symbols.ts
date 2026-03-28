export type FetchSource = 'alpha-vantage' | 'yahoo';

export interface SymbolConfig {
  alphaVantage: string; // Alpha Vantage ticker format (.TRT for TSX)
  yahoo: string; // Yahoo Finance ticker format (.TO for TSX)
  displayName: string;
  fullName: string;
  /** Ordered fallback chain — first source is tried first */
  priority: [FetchSource, FetchSource];
}

// Yahoo is primary for ALL symbols — it's free with no rate limit.
// Alpha Vantage is the backup, only used when Yahoo fails,
// and only during market hours (see market-hours.ts).
export const SYMBOLS: Record<string, SymbolConfig> = {
  VEQT: {
    alphaVantage: 'VEQT.TRT',
    yahoo: 'VEQT.TO',
    displayName: 'VEQT',
    fullName: 'Vanguard All-Equity ETF Portfolio',
    priority: ['yahoo', 'alpha-vantage'],
  },
  XEQT: {
    alphaVantage: 'XEQT.TRT',
    yahoo: 'XEQT.TO',
    displayName: 'XEQT',
    fullName: 'iShares Core Equity ETF Portfolio',
    priority: ['yahoo', 'alpha-vantage'],
  },
  ZEQT: {
    alphaVantage: 'ZEQT.TRT',
    yahoo: 'ZEQT.TO',
    displayName: 'ZEQT',
    fullName: 'BMO All-Equity ETF',
    priority: ['yahoo', 'alpha-vantage'],
  },
  VGRO: {
    alphaVantage: 'VGRO.TRT',
    yahoo: 'VGRO.TO',
    displayName: 'VGRO',
    fullName: 'Vanguard Growth ETF Portfolio',
    priority: ['yahoo', 'alpha-vantage'],
  },
  XGRO: {
    alphaVantage: 'XGRO.TRT',
    yahoo: 'XGRO.TO',
    displayName: 'XGRO',
    fullName: 'iShares Core Growth ETF Portfolio',
    priority: ['yahoo', 'alpha-vantage'],
  },
  VFV: {
    alphaVantage: 'VFV.TRT',
    yahoo: 'VFV.TO',
    displayName: 'VFV',
    fullName: 'Vanguard S&P 500 Index ETF',
    priority: ['yahoo', 'alpha-vantage'],
  },
  VUN: {
    alphaVantage: 'VUN.TRT',
    yahoo: 'VUN.TO',
    displayName: 'VUN',
    fullName: 'Vanguard US Total Market Index ETF',
    priority: ['yahoo', 'alpha-vantage'],
  },
} as const;

/** Helper: get config by display name (case-insensitive) */
export function getSymbolConfig(displayName: string): SymbolConfig | undefined {
  return SYMBOLS[displayName.toUpperCase()];
}
