export const SITE_URL = 'https://buyveqt.com';
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
