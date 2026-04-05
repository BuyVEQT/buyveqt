import Link from "next/link";
import { LEARN_ARTICLES } from "@/lib/constants";

export default function LearnPreview() {
  // Separate editorial (featured) from regular articles
  const featured = LEARN_ARTICLES.find(
    (a) => "editorial" in a && a.editorial
  );
  const rest = LEARN_ARTICLES.filter((a) => a !== featured);

  return (
    <section className="py-12">
      <p className="section-label mb-2">Research</p>
      <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--color-text-primary)] mb-1.5">
        Learn
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        Guides and explainers for VEQT investors.
      </p>

      {/* Asymmetric layout: featured article spans left, regular stack right */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Featured / editorial article — larger presence */}
        {featured && (
          <Link
            href={`/learn/${featured.slug}`}
            className="group card-editorial p-6 md:col-span-3 border-[var(--color-brand)]/30 hover:border-[var(--color-brand)]/60 flex flex-col justify-between"
          >
            <div>
              <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-brand)] mb-2">
                Our Take
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors leading-snug">
                {featured.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-3 leading-relaxed">
                {featured.teaser}
              </p>
            </div>
            <span className="inline-block mt-5 text-sm font-medium text-[var(--color-brand)]">
              Read more &rarr;
            </span>
          </Link>
        )}

        {/* Regular articles — stacked vertically on right */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {rest.map((article) => (
            <Link
              key={article.slug}
              href={`/learn/${article.slug}`}
              className="group card-editorial p-5 flex-1"
            >
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors leading-snug">
                {article.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-2.5 leading-relaxed">
                {article.teaser}
              </p>
              <span className="inline-block mt-3 text-sm font-medium text-[var(--color-brand)]">
                Read more &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
