import type { ArticleFrontmatter } from "@/lib/articles";
import { LEARN_PATHS } from "@/lib/learn-paths-data";
import PathCard from "./PathCard";

interface PathsGridProps {
  articles: ArticleFrontmatter[];
}

export default function PathsGrid({ articles }: PathsGridProps) {
  return (
    <section className="mt-8 sm:mt-12 mb-10 sm:mb-14">
      <div className="flex items-baseline gap-4 mb-5">
        <h2
          className="bs-display text-[1.5rem] sm:text-[1.875rem]"
          style={{ color: "var(--ink)" }}
        >
          Find your path.
        </h2>
        <p className="bs-caption italic" style={{ color: "var(--ink-soft)" }}>
          Six ways in — choose the one that fits where you are.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LEARN_PATHS.map((path) => (
          <PathCard key={path.id} path={path} articles={articles} />
        ))}
      </div>
    </section>
  );
}
