export const SITE_URL = 'https://www.buyveqt.ca';
export const SITE_NAME = 'BuyVEQT';
export const SITE_DESCRIPTION =
  'The community hub for VEQT investors. Live data, fund comparisons, and educational content for Canadian passive investors.';
export const SITE_LOCALE = 'en_CA';

/**
 * Build a full canonical URL from a path.
 * @param path - e.g., '/compare' or '/learn/what-is-veqt'
 */
export function canonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Build BreadcrumbList JSON-LD schema.
 * @param items - ordered array of breadcrumb items
 */
export function buildBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

/**
 * Build the VEQT FAQ schema. Rendered on pages that genuinely answer these
 * questions (home, inside-veqt) — NOT on every page via the root layout.
 * Google's structured-data guidance treats FAQPage as page-specific; running
 * the same block site-wide is treated as decorative and can be penalized.
 */
export function buildFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is VEQT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "VEQT (Vanguard All-Equity ETF Portfolio) is a single-ticket ETF that provides instant exposure to 13,726 stocks across 50 countries (April 30, 2026). It holds 4 underlying Vanguard index ETFs covering the US (~44.5%), Canada (~30.6%), international developed (~17.7%), and emerging markets (~7.2%). It is designed for long-term Canadian passive investors.",
        },
      },
      {
        '@type': 'Question',
        name: "What is VEQT's MER?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "VEQT's management fee is 0.17%, reduced from 0.22% effective November 18, 2025. Its MER (the all-in figure, which adds operating costs and tax) was last officially reported at 0.24% for a prior fiscal year and is being recalculated — it is expected to land near 0.19-0.20% once the fee cut is fully reflected.",
        },
      },
      {
        '@type': 'Question',
        name: 'Should I hold VEQT in a TFSA or RRSP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For most Canadians, especially younger investors, holding VEQT in a TFSA is recommended. All growth and distributions are completely tax-free. Higher-income earners may benefit from the RRSP tax deduction. Non-registered accounts should only be used after registered accounts are maxed.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between VEQT and XEQT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Both are all-equity, globally diversified single-ticket ETFs with identical management fees (0.17%) and effectively identical MERs (~0.20%). XEQT (iShares) has slightly more US exposure (~45% vs ~43%). VEQT (Vanguard) has more Canadian exposure (~31% vs ~25%). Performance has been very similar. The differences are small enough that most investors won't notice over a 20-year horizon.",
        },
      },
      {
        '@type': 'Question',
        name: 'How often does VEQT pay distributions?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'VEQT pays one annual distribution, typically with an ex-dividend date in late December and payment in early January. The most recent confirmed distribution was $0.76018 per unit (December 2025).',
        },
      },
    ],
  };
}

/**
 * Schema.org InvestmentFund schema for VEQT itself. Rendered on pages
 * specifically about the fund (home, inside-veqt) — not site-wide.
 */
export function buildInvestmentFundSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'InvestmentFund',
    name: 'Vanguard All-Equity ETF Portfolio',
    alternateName: 'VEQT',
    tickerSymbol: 'VEQT.TO',
    exchange: 'Toronto Stock Exchange',
    url: 'https://www.vanguard.ca/en/product/etf/asset-allocation/9692/vanguard-all-equity-etf-portfolio',
    description:
      'A single-ticket, globally diversified, all-equity ETF holding approximately 13,700 stocks across 50 countries through 4 underlying Vanguard index ETFs.',
    provider: {
      '@type': 'Organization',
      name: 'Vanguard Investments Canada Inc.',
    },
    feesAndCommissionsSpecification:
      'Management fee 0.17% (reduced from 0.22% effective November 18, 2025). MER pending fiscal year-end recalculation; last reported at 0.24%, expected near 0.19-0.20%.',
  };
}
