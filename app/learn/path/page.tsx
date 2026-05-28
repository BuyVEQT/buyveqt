import type { Metadata } from "next";
import Link from "next/link";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import AllPathsGrid from "@/components/learn/AllPathsGrid";
import { getAllArticles } from "@/lib/articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "All Learn Paths — Six Ways In",
  description:
    "Six curated reading paths through the VEQT corpus — from \"I'm new to this\" to \"I'm planning withdrawal.\" Each path is 4–6 dispatches in the order we think they belong.",
  alternates: { canonical: canonicalUrl("/learn/path") },
  openGraph: {
    title: "All Learn Paths — Six Ways In",
    description:
      "Six curated reading paths through the VEQT corpus. Each is 4–6 dispatches in the order we think they belong.",
    url: canonicalUrl("/learn/path"),
  },
};

/**
 * /learn/path — index page listing all six reading paths.
 *
 * PathsGrid on /learn surfaces three; this page is the "see all six"
 * destination. Same flip-card treatment as PathsGrid, two-column on
 * desktop, single column on mobile.
 */
export default function AllPathsPage() {
  const articles = getAllArticles();

  return (
    <InteriorShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
          { name: "All paths", path: "/learn/path" },
        ])}
      />

      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 pt-8 pb-4 bs-caption"
        style={{ color: "var(--ink-soft)" }}
        aria-label="Breadcrumb"
      >
        <Link href="/" className="bs-link">
          Home
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/learn" className="bs-link">
          Learn
        </Link>
        <span aria-hidden="true">·</span>
        <span style={{ color: "var(--ink)" }}>All paths</span>
      </nav>

      {/* Header */}
      <header className="pb-8 mb-8 border-b border-[var(--color-border)]">
        <p className="bs-stamp mb-3">The paths</p>
        <h1
          className="bs-display text-[2.25rem] sm:text-[3rem] lg:text-[3.75rem] leading-[0.95]"
          style={{ color: "var(--ink)" }}
        >
          Six ways in.
        </h1>
        <p
          className="bs-body italic mt-3 max-w-[60ch] text-[1rem] sm:text-[1.0625rem]"
          style={{ color: "var(--ink-soft)" }}
        >
          Every reading path on the site. Each is 4–6 dispatches in the order we
          think they belong — pick the question that fits.
        </p>
      </header>

      <AllPathsGrid articles={articles} />
    </InteriorShell>
  );
}
