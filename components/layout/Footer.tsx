import Link from "next/link";
import { DISCLAIMER, NAV_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
          {/* Branding */}
          <div>
            <p className="text-base font-bold tracking-tight">
              Buy<span className="text-[var(--color-brand)]">VEQT</span>
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              The unofficial VEQT investor resource
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            <a
              href="https://reddit.com/r/justBuyVEQT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              r/JustBuyVEQT
            </a>
            <a
              href="https://twitter.com/BuyVEQT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              aria-label="Follow on X"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Disclaimer + copyright */}
        <div className="border-t border-[var(--color-border)] pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
            {DISCLAIMER}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] shrink-0">
            &copy; {new Date().getFullYear()} BuyVEQT.com
          </p>
        </div>
      </div>
    </footer>
  );
}
