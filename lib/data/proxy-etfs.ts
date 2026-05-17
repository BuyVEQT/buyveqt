/**
 * Proxy-ETF map for live sector / country attribution.
 *
 * There is no clean free API for "what did sector X return today" across
 * Canadian, US, international, and emerging-market equity sleeves. The
 * pragmatic industry standard is to use liquid sector/country ETFs as
 * the daily-return proxy:
 *
 *   - US sectors → SPDR Select Sector SPDRs (XLK, XLF, XLV…)
 *   - Canadian sectors → iShares Canadian sector ETFs (XEG.TO, XFN.TO…)
 *   - International countries → iShares MSCI single-country ETFs (EWJ…)
 *   - Emerging-market countries → iShares MSCI single-country ETFs (EWZ…)
 *
 * The proxy isn't identical to the underlying sleeve's exact sector
 * basket (XLK ≠ "VUN's tech holdings") but it's the daily-direction +
 * magnitude indicator that matters for attribution UI. UI surfaces
 * should label this as "sector index returns" rather than implying
 * exact sleeve attribution.
 *
 * Display names match the row names in data/region-drilldown.ts so the
 * sector-returns endpoint and the drill rows can be joined without
 * extra mapping in the component.
 */

export interface ProxyEntry {
  /** Display name as rendered in the UI ("Tech", "Financials"). */
  display: string;
  /** Yahoo ticker for the proxy ETF. */
  ticker: string;
}

/**
 * US sector proxies — Select Sector SPDRs. Coverage matches GICS L1
 * (11 sectors).
 */
export const US_SECTOR_PROXIES: ProxyEntry[] = [
  { display: 'Technology', ticker: 'XLK' },
  { display: 'Communication Services', ticker: 'XLC' },
  { display: 'Consumer Discretionary', ticker: 'XLY' },
  { display: 'Industrials', ticker: 'XLI' },
  { display: 'Financials', ticker: 'XLF' },
  { display: 'Health Care', ticker: 'XLV' },
  { display: 'Energy', ticker: 'XLE' },
  { display: 'Real Estate', ticker: 'XLRE' },
  { display: 'Consumer Staples', ticker: 'XLP' },
  { display: 'Materials', ticker: 'XLB' },
  { display: 'Utilities', ticker: 'XLU' },
];

/**
 * Canadian sector proxies — iShares CDN sector ETFs. Some sectors lack
 * a dedicated Canadian ETF; we use the US-listed equivalent where the
 * sector composition is similar enough (e.g. Comm Services maps to XLC
 * — Canadian telecom-heavy but the daily direction tracks closely).
 */
export const CA_SECTOR_PROXIES: ProxyEntry[] = [
  { display: 'Financials', ticker: 'XFN.TO' },
  { display: 'Energy', ticker: 'XEG.TO' },
  { display: 'Materials', ticker: 'XMA.TO' },
  { display: 'Industrials', ticker: 'XIN.TO' },
  { display: 'Technology', ticker: 'XIT.TO' },
  { display: 'Consumer Staples', ticker: 'XST.TO' },
  { display: 'Consumer Discretionary', ticker: 'XCD.TO' },
  { display: 'Utilities', ticker: 'ZUT.TO' },
  // No dedicated CDN telecom ETF — XLC is the closest liquid proxy.
  { display: 'Telecom', ticker: 'XLC' },
];

/**
 * International developed-market country proxies — iShares MSCI
 * single-country ETFs. Covers VIU's top countries.
 */
export const INTL_COUNTRY_PROXIES: ProxyEntry[] = [
  { display: 'Japan', ticker: 'EWJ' },
  { display: 'United Kingdom', ticker: 'EWU' },
  { display: 'U.K.', ticker: 'EWU' },
  { display: 'France', ticker: 'EWQ' },
  { display: 'Switzerland', ticker: 'EWL' },
  { display: 'Germany', ticker: 'EWG' },
  { display: 'Netherlands', ticker: 'EWN' },
  { display: 'Australia', ticker: 'EWA' },
  { display: 'Hong Kong', ticker: 'EWH' },
  { display: 'Spain', ticker: 'EWP' },
  { display: 'Italy', ticker: 'EWI' },
  { display: 'Sweden', ticker: 'EWD' },
];

/**
 * Emerging-market country proxies — iShares MSCI single-country ETFs.
 * Covers VEE's top countries.
 */
export const EM_COUNTRY_PROXIES: ProxyEntry[] = [
  { display: 'China', ticker: 'MCHI' },
  { display: 'India', ticker: 'INDA' },
  { display: 'Taiwan', ticker: 'EWT' },
  { display: 'South Korea', ticker: 'EWY' },
  { display: 'S. Korea', ticker: 'EWY' },
  { display: 'Brazil', ticker: 'EWZ' },
  { display: 'South Africa', ticker: 'EZA' },
  { display: 'S. Africa', ticker: 'EZA' },
  { display: 'Mexico', ticker: 'EWW' },
  { display: 'Saudi Arabia', ticker: 'KSA' },
  { display: 'Saudi', ticker: 'KSA' },
];

/**
 * Flatten to a deduped list of unique tickers we need to fetch in the
 * sector-returns endpoint. (Some display aliases share a ticker, e.g.
 * "U.K." and "United Kingdom" both map to EWU.)
 */
export function allProxyTickers(): string[] {
  const all = [
    ...US_SECTOR_PROXIES,
    ...CA_SECTOR_PROXIES,
    ...INTL_COUNTRY_PROXIES,
    ...EM_COUNTRY_PROXIES,
  ];
  return Array.from(new Set(all.map((p) => p.ticker)));
}

/**
 * Look up a display name across all proxy lists. Used by the
 * sector-returns endpoint to resolve a row's name (e.g. "Tech") to the
 * right proxy ticker, scoped to a sleeve.
 */
export function findProxy(
  scope: 'us-sector' | 'ca-sector' | 'intl-country' | 'em-country',
  display: string
): ProxyEntry | null {
  const list =
    scope === 'us-sector'
      ? US_SECTOR_PROXIES
      : scope === 'ca-sector'
        ? CA_SECTOR_PROXIES
        : scope === 'intl-country'
          ? INTL_COUNTRY_PROXIES
          : EM_COUNTRY_PROXIES;

  // Accept exact display match or a tolerant "starts with" / abbrev match
  // so "Tech" can find "Technology", "Comm. Svc." can find "Communication
  // Services", etc.
  const norm = (s: string) => s.toLowerCase().replace(/\W+/g, '');
  const target = norm(display);
  return (
    list.find((p) => norm(p.display) === target) ??
    list.find(
      (p) => norm(p.display).startsWith(target) || target.startsWith(norm(p.display))
    ) ??
    null
  );
}
