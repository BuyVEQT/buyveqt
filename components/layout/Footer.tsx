import Link from "next/link";
import { DISCLAIMER, NAV_LINKS } from "@/lib/constants";
import NewsletterSignup from "@/components/NewsletterSignup";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-card)] mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
          {/* Branding — editorial serif */}
          <div>
            <p className="font-serif text-xl tracking-tight text-[var(--color-text-primary)]">
              Buy<span className="text-[var(--color-brand)]">VEQT</span>
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1.5">
              The unofficial VEQT investor resource
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-5 gap-y-0">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Meta links & Social */}
          <div className="flex items-center gap-3">
            <Link
              href="/methodology"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Methodology
            </Link>
            <span className="text-[var(--color-border)]">&middot;</span>
            <a
              href="https://reddit.com/r/JustBuyVEQT"
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
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-base)] transition-colors"
              aria-label="Follow on X"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Editorial rule */}
        <div className="editorial-rule mb-6" />

        {/* Newsletter */}
        <div className="pb-6">
          <p className="bs-stamp mb-2">
            Stay informed
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            Get notified when we launch our newsletter
          </p>
          <NewsletterSignup variant="inline" className="max-w-sm" />
        </div>

        {/* Disclaimer + copyright */}
        <div className="border-t border-[var(--color-border)] pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
            {DISCLAIMER}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] shrink-0">
            &copy; {new Date().getFullYear()} BuyVEQT.ca
          </p>
        </div>
      </div>
    </footer>
  );
}
