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
  /** Optional byline author — used on /weekly/[slug] and the home recap card. */
  author?: string;
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
      author: (data.author as string) || undefined,
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
