import Link from "next/link";
import type { WeeklyRecap } from "@/lib/weekly";
import ByLine from "@/components/ui/ByLine";

interface WeeklyRecapCardProps {
  recap: WeeklyRecap | null;
}

/**
 * Hero card surfacing the most recent weekly recap on the home page.
 * When no recap exists yet (empty /content/weekly), falls back to a
 * "coming Sunday" placeholder that still communicates the rhythm.
 */
export default function WeeklyRecapCard({ recap }: WeeklyRecapCardProps) {
  if (!recap) {
    return (
      <div className="card-editorial p-5 sm:p-6 border-dashed">
        <p className="section-label">This Week's Brief</p>
        <h3 className="font-serif text-xl sm:text-2xl mt-1 text-[var(--color-text-primary)]">
          The first weekly recap drops this Sunday.
        </h3>
        <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed">
          Every Sunday at 8pm ET, we publish a short human-written recap of
          how VEQT moved and what actually drove it. Subscribe below to be
          notified.
        </p>
      </div>
    );
  }

  const isPos = recap.weeklyChange >= 0;
  const weekRange = `${new Date(recap.weekStart).toLocaleDateString("en-CA", {
    month: "long",
    day: "numeric",
  })} – ${new Date(recap.weekEnd).toLocaleDateString("en-CA", {
    month: "long",
    day: "numeric",
  })}`;

  return (
    <Link
      href={`/weekly/${recap.slug}`}
      className="block card-editorial p-5 sm:p-6 hover:border-[var(--color-brand)]/50 transition-all group"
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p className="section-label">This Week's Brief</p>
        <span
          className={`text-sm font-bold tabular-nums px-2 py-0.5 rounded-md ${
            isPos
              ? "text-[var(--color-positive)] bg-[var(--color-positive-bg)]"
              : "text-[var(--color-negative)] bg-[var(--color-negative-bg)]"
          }`}
        >
          {isPos ? "+" : ""}
          {recap.weeklyChangePercent.toFixed(2)}%
        </span>
      </div>

      <h3 className="font-serif text-xl sm:text-2xl mt-2 text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors">
        {recap.title}
      </h3>

      <p className="text-xs text-[var(--color-text-muted)] mt-1 tabular-nums">
        {weekRange} · ${recap.veqtOpen.toFixed(2)} → ${recap.veqtClose.toFixed(2)}
      </p>

      {recap.description && (
        <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
          {recap.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        {recap.author ? (
          <ByLine author={recap.author} date={recap.date} />
        ) : (
          <span className="text-xs text-[var(--color-text-muted)]">
            {new Date(recap.date).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        )}
        <span className="text-sm font-medium text-[var(--color-brand)] group-hover:translate-x-0.5 transition-transform">
          Read the full brief &rarr;
        </span>
      </div>
    </Link>
  );
}
