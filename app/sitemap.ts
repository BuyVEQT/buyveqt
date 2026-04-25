import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/articles";
import { getAllWeeklyRecaps } from "@/lib/weekly";
import { COMPARISON_PAGES } from "@/data/comparisons";
import { SITE_URL } from "@/lib/seo-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/compare`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/invest`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/weekly`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/inside-veqt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/distributions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/learn`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/community`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/methodology`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const comparisonPages: MetadataRoute.Sitemap = Object.keys(
    COMPARISON_PAGES
  ).map((slug) => ({
    url: `${SITE_URL}/compare/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articleSlugs = getAllSlugs();
    articlePages = articleSlugs.map((slug) => ({
      url: `${SITE_URL}/learn/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.warn("[Sitemap] Failed to load article slugs:", error);
  }

  let weeklyPages: MetadataRoute.Sitemap = [];
  try {
    const recaps = getAllWeeklyRecaps();
    weeklyPages = recaps.map((recap) => ({
      url: `${SITE_URL}/weekly/${recap.slug}`,
      lastModified: new Date(recap.date),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // No weekly recaps yet
  }

  return [
    ...staticPages,
    ...comparisonPages,
    ...articlePages,
    ...weeklyPages,
  ];
}
