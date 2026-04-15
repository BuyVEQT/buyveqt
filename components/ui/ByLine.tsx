interface ByLineProps {
  author: string;
  /** ISO date string — formatted for display. */
  date?: string;
  /** Optional role suffix, e.g., "Editor" or "Founder". */
  role?: string;
  className?: string;
}

/**
 * Tiny "By {author} · {date}" credit. Used on weekly recaps and anywhere
 * else we want a human author to be visible — one of our credibility
 * advantages over AI-generated competitors.
 */
export default function ByLine({
  author,
  date,
  role,
  className = "",
}: ByLineProps) {
  const formatted = date
    ? new Date(date).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <p
      className={`text-xs text-[var(--color-text-muted)] ${className}`}
      aria-label={`Written by ${author}${formatted ? ` on ${formatted}` : ""}`}
    >
      <span className="text-[var(--color-text-secondary)]">By {author}</span>
      {role && (
        <>
          <span className="mx-1.5">·</span>
          <span>{role}</span>
        </>
      )}
      {formatted && (
        <>
          <span className="mx-1.5">·</span>
          <time dateTime={date}>{formatted}</time>
        </>
      )}
    </p>
  );
}
