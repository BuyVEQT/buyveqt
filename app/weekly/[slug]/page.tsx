import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import {
  getAllWeeklyRecaps,
  getWeeklyRecapBySlug,
} from "@/lib/weekly";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export function generateStaticParams() {
  return getAllWeeklyRecaps().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recap = getWeeklyRecapBySlug(slug);
  if (!recap) return {};

  return {
    title: recap.title,
    description: recap.description,
    alternates: { canonical: canonicalUrl(`/weekly/${slug}`) },
  };
}

export default async function WeeklyRecapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recap = getWeeklyRecapBySlug(slug);

  if (!recap) {
    notFound();
  }

  const isPos = recap.weeklyChange >= 0;

  const weekRange = `${new Date(recap.weekStart).toLocaleDateString("en-CA", {
    month: "long",
    day: "numeric",
  })}–${new Date(recap.weekEnd).toLocaleDateString("en-CA", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <PageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Weekly", path: "/weekly" },
          { name: recap.title, path: `/weekly/${slug}` },
        ])}
      />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8">
        <nav className="text-sm text-[var(--color-text-muted)] mb-6">
          <Link
            href="/weekly"
            className="hover:text-[var(--color-text-primary)] transition-colors"
          >
            Weekly
          </Link>
          <span className="mx-2">&rarr;</span>
          <span className="text-[var(--color-text-secondary)]">
            {weekRange}
          </span>
        </nav>

        {/* Header Card */}
        <div className="card-editorial p-5 sm:p-6 mb-8">
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            {weekRange}
          </p>
          <h1 className="text-xl sm:text-2xl font-serif font-normal text-[var(--color-text-primary)]">
            {recap.title}
          </h1>
          <div className="mt-3 flex items-baseline gap-4 flex-wrap">
            <span
              className={`text-2xl font-extrabold tabular-nums ${
                isPos ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
              }`}
            >
              {isPos ? "+" : ""}
              {recap.weeklyChangePercent.toFixed(2)}%
            </span>
            <span className="text-sm text-[var(--color-text-muted)] tabular-nums">
              ${recap.veqtOpen.toFixed(2)} &rarr; ${recap.veqtClose.toFixed(2)}
            </span>
            <span
              className={`text-sm font-medium tabular-nums ${
                isPos ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
              }`}
            >
              ({isPos ? "+" : ""}${recap.weeklyChange.toFixed(2)})
            </span>
          </div>
        </div>

        {/* MDX Content */}
        <div className="prose-custom">
          <MDXRemote
            source={recap.content}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
          <Link
            href="/weekly"
            className="text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
          >
            &larr; All weekly recaps
          </Link>
        </div>
      </main>
    </PageShell>
  );
}
