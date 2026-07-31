import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/** Origins that count as this site — everything else opens in a new tab. */
const INTERNAL_HOST = "buyveqt.ca";

/**
 * True for absolute http(s) links pointing at another origin. Relative
 * paths, in-page hashes, and mailto:/tel: are all "not external" and are
 * left exactly as authored.
 */
function isExternalHref(href: string): boolean {
  const match = /^https?:\/\/([^/?#]+)/i.exec(href);
  if (!match) return false;
  const host = match[1].toLowerCase().replace(/^www\./, "");
  return host !== INTERNAL_HOST;
}

/**
 * The `a` override for both MDX component maps (/learn and /weekly).
 *
 * Markdown links carry no target, so every outbound citation used to
 * navigate the reader off the article in the same tab. External links now
 * open in a new tab with `rel="noopener noreferrer"` (noopener because
 * target="_blank" otherwise hands the opened page a live window.opener
 * handle back to ours). Internal `/…` paths route through next/link for
 * client-side navigation; hashes and mailto: stay plain anchors.
 */
export function MdxLink({
  href,
  children,
  ...rest
}: ComponentPropsWithoutRef<"a">) {
  if (!href) return <a {...rest}>{children}</a>;

  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }

  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
