import Link from "next/link";

const css = `
.ins-cmp-closer {
  border-top: 1px solid var(--ins-ink, #111111);
  padding: 40px 0;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
  font-family: var(--ins-font);
  color: var(--ins-ink, #111111);
}
.ins-cmp-closer__display {
  margin: 0;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.ins-cmp-closer__sub {
  margin: 12px 0 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--ins-gray-600);
  max-width: 68ch;
  text-wrap: pretty;
}
.ins-cmp-closer__link {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-signal);
  text-decoration: none;
  border-bottom: 2px solid var(--ins-signal);
  padding-bottom: 5px;
  white-space: nowrap;
  justify-self: end;
}

@media (max-width: 640px) {
  .ins-cmp-closer {
    display: block;
    padding: 18px 0 0;
  }
  .ins-cmp-closer__display {
    font-size: 24px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .ins-cmp-closer__sub {
    margin-top: 8px;
    font-size: 12.5px;
    line-height: 1.5;
  }
  .ins-cmp-closer__link {
    display: inline-block;
    margin-top: 12px;
    font-size: 10px;
    letter-spacing: 0.14em;
    padding-bottom: 4px;
  }
}
`;

/**
 * Compare closer (artboard 6b) — permission to stop comparing, and the
 * one place on the page red is spent on a call to action.
 *
 * Server-safe: no client state; plain <style>, not styled-jsx.
 */
export default function CompareCloser() {
  return (
    <section className="ins-cmp-closer" aria-label="Closing note">
      <div>
        <p className="ins-cmp-closer__display">Still here?</p>
        <p className="ins-cmp-closer__sub">
          The differences are small because the products are good. Pick one,
          automate it, close the tab.
        </p>
      </div>
      <Link href="/calculators" className="ins-cmp-closer__link">
        Run the fee math <span aria-hidden>&rarr;</span>
      </Link>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
