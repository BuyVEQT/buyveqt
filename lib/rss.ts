import type { WeeklyRecap } from "@/lib/weekly";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo-config";

/**
 * Minimal, valid RSS 2.0 generator for the weekly recap feed.
 * Kept dependency-free: hand-built XML + strict escaping.
 */

const MAX_ITEMS = 20;

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toUTCString();
}

export function buildRssFeed(recaps: WeeklyRecap[]): string {
  const feedUrl = `${SITE_URL}/feed.xml`;
  const lastBuild =
    recaps.length > 0 ? rfc822(recaps[0].date) : new Date().toUTCString();

  const items = recaps
    .slice(0, MAX_ITEMS)
    .map((r) => {
      const link = `${SITE_URL}/weekly/${r.slug}`;
      const pubDate = rfc822(r.date);
      const title = escape(r.title);
      const description = escape(r.description || "");
      const author = r.author ? escape(r.author) : null;

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>${
        author ? `\n      <dc:creator>${author}</dc:creator>` : ""
      }
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(SITE_NAME)} Weekly</title>
    <link>${SITE_URL}/weekly</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>${escape(SITE_DESCRIPTION)}</description>
    <language>en-CA</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}
