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
          text: "VEQT (Vanguard All-Equity ETF Portfolio) is a single-ticket ETF that provides instant exposure to 13,743 stocks across 50 countries (June 30, 2026). It holds 4 underlying Vanguard index ETFs covering the US (~45.3%), Canada (~29.6%), international developed (~17.9%), and emerging markets (~7.1%). It is designed for long-term Canadian passive investors.",
        },
      },
      {
        '@type': 'Question',
        name: "What is VEQT's MER?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "VEQT's management fee is 0.17%, reduced from 0.22% effective November 18, 2025. Its MER (the all-in figure, which adds operating costs and tax) is officially 0.22% as of the June 30, 2026 factsheet (annualized to March 31, 2026) — the first recalculation to reflect the fee cut, down from 0.24%.",
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
          text: "Both are all-equity, globally diversified single-ticket ETFs with identical management fees (0.17%) and near-identical MERs (0.22% vs 0.20%). Their US weights now sit within a point of each other (~45%); the real difference is home bias — VEQT holds ~30% Canada by design, XEQT ~25%. Performance has been very similar. The differences are small enough that most investors won't notice over a 20-year horizon.",
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
      'Management fee 0.17% (reduced from 0.22% effective November 18, 2025). Official MER 0.22% per the June 30, 2026 factsheet (annualized to March 31, 2026), down from 0.24%.',
  };
}
