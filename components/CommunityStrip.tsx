import Link from "next/link";

export default function CommunityStrip() {
  return (
    <section className="py-6">
      <div className="flex flex-col items-center gap-4">
        <span className="text-sm text-[var(--color-text-muted)]">
          Join the community
        </span>
        <div className="flex items-center gap-4">
          <a
            href="https://reddit.com/r/justBuyVEQT"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-sm"
          >
            r/JustBuyVEQT
          </a>
          <a
            href="https://twitter.com/BuyVEQT"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors text-sm"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @BuyVEQT
          </a>
        </div>
        <Link
          href="/today"
          className="text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
        >
          See VEQT Today &rarr;
        </Link>
      </div>
    </section>
  );
}
