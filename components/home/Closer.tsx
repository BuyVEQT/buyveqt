import Link from "next/link";

const css = `
.ins-closer {
  border-top: 1px solid var(--ins-ink, #111111);
  padding-top: 40px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
  font-family: var(--ins-font);
  color: var(--ins-ink, #111111);
}
.ins-closer__display {
  margin: 0;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.ins-closer__sub {
  margin: 12px 0 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.ins-closer__link {
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
/* Red-discipline default — see the contract note on the component. */
.ins-closer__link--ink {
  color: var(--ins-ink, #111111);
  border-bottom-color: var(--ins-ink, #111111);
}

@media (max-width: 640px) {
  .ins-closer {
    display: block;
    padding-top: 18px;
  }
  .ins-closer__display {
    font-size: 24px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .ins-closer__sub {
    margin-top: 8px;
    font-size: 12.5px;
    line-height: 1.5;
  }
  .ins-closer__link {
    display: inline-block;
    margin-top: 12px;
    font-size: 10px;
    letter-spacing: 0.14em;
    padding-bottom: 4px;
  }
}
`;

/**
 * Closer — "permission to leave" (handoff §1.8, closer only; the footer
 * band belongs to the shell).
 *
 * 1px ink rule · "You've seen the number." · one-line summary of the day
 * ("Up/Down x.xx% today. Nothing needs your attention…") · THE DAILY NOTE
 * link. Direction is spelled out ("Up"/"Down"), never color-only. Mobile
 * stacks with the link under the text.
 *
 * RED DISCIPLINE (build contract §6): signal red never sits adjacent to a
 * brand-red call to action. On a down day the sub-line above this link is
 * a live negative stat, so the CTA drops to ink — 2px ink underline, ink
 * text — and red is left to mean one thing on the screen: the loss. On an
 * up day (or when there is no reading at all) the CTA keeps its red,
 * because nothing on the page is competing for it.
 *
 * The switch is driven off the same `changePercent` the sub-line prints,
 * so the rule cannot drift out of step with the number it is reacting to.
 *
 * Server-safe: no client state; plain <style>, not styled-jsx.
 */
export default function Closer({
  changePercent,
}: {
  changePercent: number | null;
}) {
  const rest = "Nothing needs your attention until tomorrow, 9:30 ET.";
  const sub =
    changePercent === null
      ? rest
      : `${changePercent < 0 ? "Down" : "Up"} ${Math.abs(
          changePercent
        ).toFixed(2)}% today. ${rest}`;

  const negativeInView = changePercent !== null && changePercent < 0;

  return (
    <section className="ins-closer" aria-label="Closing note">
      <div>
        <p className="ins-closer__display">You&rsquo;ve seen the number.</p>
        <p className="ins-closer__sub">{sub}</p>
      </div>
      <Link
        href="/weekly"
        className={`ins-closer__link${
          negativeInView ? " ins-closer__link--ink" : ""
        }`}
      >
        The daily note <span aria-hidden>→</span>
      </Link>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
