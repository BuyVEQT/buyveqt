import Link from "next/link";
import { LEARN_ARTICLES } from "@/lib/constants";

export default function LearnPreview() {
  return (
    <section className="py-10">
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
        Learn
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Guides and explainers for VEQT investors.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LEARN_ARTICLES.map((article) => {
          const isEditorial = "editorial" in article && article.editorial;
          return (
            <Link
              key={article.slug}
              href={`/learn/${article.slug}`}
              className={`group rounded-lg border bg-[var(--color-card)] p-5 transition-colors ${
                isEditorial
                  ? "border-[var(--color-brand)]/40 hover:border-[var(--color-brand)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-border-light)]"
              }`}
            >
              {isEditorial && (
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand)] mb-1.5">
                  Our Take
                </span>
              )}
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed">
                {article.teaser}
              </p>
              <span className="inline-block mt-3 text-sm font-medium text-[var(--color-brand)]">
                Read more &rarr;
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
