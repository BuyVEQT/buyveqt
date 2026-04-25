import fs from "fs";
import path from "path";
import matter from "gray-matter";

const WEEKLY_DIR = path.join(process.cwd(), "content/weekly");

export interface WeeklyRecap {
  slug: string;
  title: string;
  date: string;
  description: string;
  weekStart: string;
  weekEnd: string;
  veqtOpen: number;
  veqtClose: number;
  weeklyChange: number;
  weeklyChangePercent: number;
  content: string;
}

export function getAllWeeklyRecaps(): WeeklyRecap[] {
  if (!fs.existsSync(WEEKLY_DIR)) return [];

  const files = fs
    .readdirSync(WEEKLY_DIR)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"));

  const recaps = files.map((filename) => {
    const filePath = path.join(WEEKLY_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return {
      slug: (data.slug as string) || filename.replace(".mdx", ""),
      title: data.title as string,
      date: data.date as string,
      description: (data.description as string) || "",
      weekStart: data.weekStart as string,
      weekEnd: data.weekEnd as string,
      veqtOpen: (data.veqtOpen as number) || 0,
      veqtClose: (data.veqtClose as number) || 0,
      weeklyChange: (data.weeklyChange as number) || 0,
      weeklyChangePercent: (data.weeklyChangePercent as number) || 0,
      content,
    };
  });

  return recaps.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getWeeklyRecapBySlug(slug: string): WeeklyRecap | null {
  const recaps = getAllWeeklyRecaps();
  return recaps.find((r) => r.slug === slug) || null;
}

export function getLatestWeeklyRecap(): WeeklyRecap | null {
  const recaps = getAllWeeklyRecaps();
  return recaps[0] || null;
}

/**
 * Adjacent recaps for the per-recap dispatch chrome.
 *
 * "Previous" is the recap one week earlier (older), "next" is one
 * week later (newer). Lists are sorted newest-first by getAllWeeklyRecaps,
 * so previous = idx + 1 and next = idx - 1 in that ordering. Returns
 * null when there isn't one — we never surface arbitrary fallbacks.
 */
export function getAdjacentRecaps(slug: string): {
  previous: WeeklyRecap | null;
  next: WeeklyRecap | null;
} {
  const recaps = getAllWeeklyRecaps();
  const idx = recaps.findIndex((r) => r.slug === slug);
  if (idx === -1) return { previous: null, next: null };
  return {
    previous: recaps[idx + 1] ?? null,
    next: recaps[idx - 1] ?? null,
  };
}

/** 1-based dispatch number — oldest recap is No. 01. */
export function getRecapOrdinal(slug: string): number | null {
  const recaps = getAllWeeklyRecaps();
  const idx = recaps.findIndex((r) => r.slug === slug);
  if (idx === -1) return null;
  return recaps.length - idx;
}
