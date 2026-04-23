import Link from "next/link";

/**
 * Shared colophon / footer for the broadsheet pages.
 * Extracted from the home page so /learn, /compare, /invest etc. can reuse
 * the same three-column treatment. Home and interior pages both render this.
 */
export default function Colophon() {
  return (
    <footer className="py-12 sm:py-16 bs-enter">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-6 border-b border-[var(--ink)]">
        <div>
          <p className="bs-stamp mb-3">The Broadsheet</p>
          <p className="bs-caption">
            An unaffiliated, unpaid, single-subject broadsheet for holders of
            the Vanguard All-Equity ETF Portfolio. Typeset in Fraunces and
            Newsreader.
          </p>
        </div>
        <div>
          <p className="bs-stamp mb-3">The Navigation</p>
          <ul className="space-y-1.5 bs-body text-[0.95rem]">
            <li>
              <Link href="/compare" className="bs-link">
                The Comparison
              </Link>
            </li>
            <li>
              <Link href="/invest" className="bs-link">
                The Calculator
              </Link>
            </li>
            <li>
              <Link href="/inside-veqt" className="bs-link">
                The Portfolio
              </Link>
            </li>
            <li>
              <Link href="/learn" className="bs-link">
                Learn
              </Link>
            </li>
            <li>
              <Link href="/distributions" className="bs-link">
                Distributions
              </Link>
            </li>
            <li>
              <Link href="/methodology" className="bs-link">
                Methodology
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="bs-stamp mb-3">The Disclaimer</p>
          <p className="bs-caption">
            Not affiliated with, endorsed by, or sponsored by Vanguard. Nothing
            here is financial advice. All prices informational only and may be
            delayed. Consult a qualified advisor before investing.
          </p>
        </div>
      </div>

      <p className="bs-label text-center mt-6">
        &copy; {new Date().getFullYear()} BuyVEQT.ca &middot; Printed on the
        Internet &middot; Every Sunday, and whenever the market requires it
      </p>
    </footer>
  );
}
