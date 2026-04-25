// Server-side module: validates all path slugs exist on disk at import time.
// Client components should import from lib/learn-paths-data.ts instead.
import fs from "fs";
import path from "path";
import { LEARN_PATHS } from "./learn-paths-data";

export type { LearnPath } from "./learn-paths-data";
export { LEARN_PATHS } from "./learn-paths-data";

const CONTENT_DIR = path.join(process.cwd(), "content", "learn");

function assertSlugExists(slug: string): void {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`[learn-paths] Slug not found: "${slug}". Check content/learn/${slug}.mdx`);
  }
}

// Validate at module load — fail loudly if any slug is missing
if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
  try {
    for (const p of LEARN_PATHS) {
      for (const slug of p.slugs) {
        assertSlugExists(slug);
      }
    }
  } catch (e) {
    // Only throw in Node.js server context, not during client-side bundling
    if (typeof window === "undefined") {
      throw e;
    }
  }
}
