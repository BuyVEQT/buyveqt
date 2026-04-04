export function OwnershipDiagram() {
  return (
    <figure className="my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vanguard side */}
        <div
          className="rounded-lg border border-[var(--color-border)] p-6 flex flex-col items-center"
          style={{ backgroundColor: "var(--color-card)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-positive)] mb-5">
            Vanguard — Mutual Ownership
          </p>

          <svg
            viewBox="0 0 240 220"
            className="w-full max-w-[240px]"
            aria-label="Vanguard circular ownership: You invest in Vanguard Funds, which own Vanguard the company, which serves You"
            role="img"
          >
            {/* Circular arrow path */}
            <defs>
              <marker
                id="arrow-green"
                viewBox="0 0 10 7"
                refX="10"
                refY="3.5"
                markerWidth="8"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-positive)" />
              </marker>
            </defs>

            {/* Three nodes in a triangle */}
            {/* Top: You */}
            <rect x="75" y="4" width="90" height="36" rx="8" fill="var(--color-positive-bg)" stroke="var(--color-positive)" strokeWidth="1.5" />
            <text x="120" y="27" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--color-text-primary)">You</text>

            {/* Bottom-right: Vanguard Funds */}
            <rect x="130" y="130" width="106" height="36" rx="8" fill="var(--color-positive-bg)" stroke="var(--color-positive)" strokeWidth="1.5" />
            <text x="183" y="148" textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--color-text-primary)">Vanguard Funds</text>
            <text x="183" y="161" textAnchor="middle" fontSize="9" fill="var(--color-text-muted)">(VEQT, etc.)</text>

            {/* Bottom-left: Vanguard Co */}
            <rect x="4" y="130" width="106" height="36" rx="8" fill="var(--color-positive-bg)" stroke="var(--color-positive)" strokeWidth="1.5" />
            <text x="57" y="153" textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--color-text-primary)">Vanguard Inc.</text>

            {/* Arrows forming a loop */}
            {/* You → Funds (right side going down) */}
            <path d="M155,40 Q200,80 210,130" fill="none" stroke="var(--color-positive)" strokeWidth="1.5" markerEnd="url(#arrow-green)" />
            <text x="200" y="82" textAnchor="middle" fontSize="9" fill="var(--color-text-muted)">invest in</text>

            {/* Funds → Company (bottom going left) */}
            <path d="M130,150 L110,150" fill="none" stroke="var(--color-positive)" strokeWidth="1.5" markerEnd="url(#arrow-green)" />
            <text x="120" y="143" textAnchor="middle" fontSize="9" fill="var(--color-text-muted)">own</text>

            {/* Company → You (left side going up) */}
            <path d="M30,130 Q10,80 85,40" fill="none" stroke="var(--color-positive)" strokeWidth="1.5" markerEnd="url(#arrow-green)" />
            <text x="28" y="82" textAnchor="middle" fontSize="9" fill="var(--color-text-muted)">serves</text>

            {/* Center label */}
            <text x="120" y="100" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--color-positive)">One set of</text>
            <text x="120" y="113" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--color-positive)">interests</text>

            {/* Checkmark */}
            <circle cx="120" cy="200" r="12" fill="var(--color-positive-bg)" stroke="var(--color-positive)" strokeWidth="1.5" />
            <path d="M113,200 L118,205 L128,195" fill="none" stroke="var(--color-positive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* BlackRock side */}
        <div
          className="rounded-lg border border-[var(--color-border)] p-6 flex flex-col items-center"
          style={{ backgroundColor: "var(--color-card)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-5">
            BlackRock — Public Corporation
          </p>

          <svg
            viewBox="0 0 240 220"
            className="w-full max-w-[240px]"
            aria-label="BlackRock split ownership: You invest in iShares funds managed by BlackRock, but BlackRock is also owned by external shareholders on NYSE"
            role="img"
          >
            <defs>
              <marker
                id="arrow-gray"
                viewBox="0 0 10 7"
                refX="10"
                refY="3.5"
                markerWidth="8"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-text-muted)" />
              </marker>
              <marker
                id="arrow-red"
                viewBox="0 0 10 7"
                refX="10"
                refY="3.5"
                markerWidth="8"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-negative)" />
              </marker>
            </defs>

            {/* Top-left: You */}
            <rect x="4" y="4" width="90" height="36" rx="8" fill="var(--color-card-hover)" stroke="var(--color-border)" strokeWidth="1.5" />
            <text x="49" y="27" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--color-text-primary)">You</text>

            {/* Top-right: External Shareholders */}
            <rect x="130" y="4" width="106" height="36" rx="8" fill="var(--color-negative-bg)" stroke="var(--color-negative)" strokeWidth="1" opacity="0.85" />
            <text x="183" y="20" textAnchor="middle" fontSize="10" fontWeight="500" fill="var(--color-text-primary)">Wall Street</text>
            <text x="183" y="33" textAnchor="middle" fontSize="9" fill="var(--color-text-muted)">(NYSE: BLK)</text>

            {/* Middle: BlackRock */}
            <rect x="60" y="100" width="120" height="36" rx="8" fill="var(--color-card-hover)" stroke="var(--color-border)" strokeWidth="1.5" />
            <text x="120" y="123" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--color-text-primary)">BlackRock Inc.</text>

            {/* Bottom: iShares Funds */}
            <rect x="60" y="180" width="120" height="36" rx="8" fill="var(--color-card-hover)" stroke="var(--color-border)" strokeWidth="1.5" />
            <text x="120" y="198" textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--color-text-primary)">iShares Funds</text>
            <text x="120" y="211" textAnchor="middle" fontSize="9" fill="var(--color-text-muted)">(XEQT, etc.)</text>

            {/* You → iShares (left side going down) */}
            <path d="M49,40 L49,70 Q49,80 59,85 L80,95 Q90,100 90,100" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" markerEnd="url(#arrow-gray)" />
            <text x="38" y="75" textAnchor="end" fontSize="9" fill="var(--color-text-muted)">invest in</text>

            {/* BlackRock → Funds (down) */}
            <path d="M120,136 L120,178" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" markerEnd="url(#arrow-gray)" />
            <text x="130" y="162" textAnchor="start" fontSize="9" fill="var(--color-text-muted)">manages</text>

            {/* Shareholders → BlackRock (right side going down) */}
            <path d="M183,40 L183,70 Q183,80 173,85 L155,95 Q150,100 150,100" fill="none" stroke="var(--color-negative)" strokeWidth="1.5" markerEnd="url(#arrow-red)" opacity="0.7" />
            <text x="196" y="75" textAnchor="start" fontSize="9" fill="var(--color-negative)" opacity="0.8">owns</text>

            {/* Center tension label */}
            <text x="120" y="80" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--color-negative)" opacity="0.8">Two sets of</text>
            <text x="120" y="93" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--color-negative)" opacity="0.8">interests</text>
          </svg>
        </div>
      </div>

      <figcaption className="text-center text-xs text-[var(--color-text-muted)] mt-4">
        Vanguard's investors own the company. BlackRock's investors share it with Wall Street.
      </figcaption>
    </figure>
  );
}
