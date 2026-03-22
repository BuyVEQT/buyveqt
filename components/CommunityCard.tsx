export default function CommunityCard() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
        Community
      </h2>

      <p className="text-sm text-[var(--color-text-muted)] mb-4">
        Join thousands of Canadian investors discussing VEQT strategy,
        portfolio allocation, and long-term wealth building.
      </p>

      <div className="flex flex-col gap-2">
        <a
          href="https://reddit.com/r/BuyVEQT"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)] transition-colors"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="shrink-0 text-[#FF4500]">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0zm6.508 13.533c.063.326.097.661.097 1.003 0 3.236-3.75 5.864-8.382 5.864S1.84 17.772 1.84 14.536c0-.342.034-.677.097-1.003A1.77 1.77 0 011.25 12c0-.975.793-1.768 1.768-1.768.467 0 .892.183 1.207.48 1.223-.877 2.896-1.427 4.752-1.468l.89-4.182a.382.382 0 01.456-.305l2.964.623c.218-.483.7-.818 1.262-.818.769 0 1.392.623 1.392 1.392s-.623 1.392-1.392 1.392-1.392-.623-1.392-1.392l-2.637-.554-.792 3.727c1.82.053 3.455.603 4.654 1.466.315-.297.74-.48 1.207-.48.975 0 1.768.793 1.768 1.768 0 .658-.363 1.232-.897 1.533zM8.894 13.178c-.769 0-1.392.623-1.392 1.392s.623 1.392 1.392 1.392 1.392-.623 1.392-1.392-.623-1.392-1.392-1.392zm6.213 0c-.769 0-1.392.623-1.392 1.392s.623 1.392 1.392 1.392 1.392-.623 1.392-1.392-.623-1.392-1.392-1.392zm-5.806 4.248a.382.382 0 01.54 0c.65.65 1.554.958 2.382.958s1.732-.308 2.382-.958a.382.382 0 01.54.54c-.792.792-1.863 1.183-2.922 1.183s-2.13-.39-2.922-1.183a.382.382 0 010-.54z" />
          </svg>
          <span className="font-medium">r/JustBuyVEQT</span>
          <svg
            className="w-3.5 h-3.5 ml-auto text-[var(--color-text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </a>

        <a
          href="https://twitter.com/BuyVEQT"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] px-3 py-2.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)] transition-colors"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="shrink-0">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="font-medium">@BuyVEQT</span>
          <svg
            className="w-3.5 h-3.5 ml-auto text-[var(--color-text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </a>
      </div>
    </div>
  );
}
