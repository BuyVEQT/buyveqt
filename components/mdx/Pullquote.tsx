import type { ReactNode } from "react";

interface PullquoteProps {
  children: ReactNode;
  attribution?: string;
  /** Optional float alignment on wide screens. Default renders full-width. */
  align?: "center" | "left" | "right";
}

/**
 * Editorial pull quote. Breaks up long prose with a wide-column moment.
 *
 *   <Pullquote attribution="— The Hold Line">
 *     Time in the market beats timing the market.
 *   </Pullquote>
 *
 * Lives in components/mdx so it can be imported into the MDX renderer map.
 * Styled to the broadsheet palette via var(--ink), var(--stamp), etc.
 */
export function Pullquote({
  children,
  attribution,
  align = "center",
}: PullquoteProps) {
  const alignment =
    align === "left"
      ? "text-left ml-0 mr-auto"
      : align === "right"
        ? "text-right ml-auto mr-0"
        : "text-center mx-auto";

  return (
    <figure
      className={`my-10 sm:my-12 max-w-[44ch] ${alignment}`}
      style={{ color: "var(--ink)" }}
    >
      <blockquote
        className="bs-display-italic text-[1.75rem] sm:text-[2.25rem] leading-[1.05]"
        style={{ color: "var(--ink)" }}
      >
        {children}
      </blockquote>
      {attribution && (
        <figcaption className="bs-label mt-4">{attribution}</figcaption>
      )}
    </figure>
  );
}
