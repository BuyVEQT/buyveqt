const css = `
.ins-cmcloser {
  border-top: 1px solid var(--ins-ink, #111111);
  padding-top: 40px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
  font-family: var(--ins-font);
  color: var(--ins-ink, #111111);
}
.ins-cmcloser__display {
  margin: 0;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.ins-cmcloser__sub {
  margin: 12px 0 0;
  max-width: 56ch;
  font-size: 15px;
  font-weight: 500;
  color: var(--ins-gray-600);
}
.ins-cmcloser__link {
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
  .ins-cmcloser {
    display: block;
    padding-top: 18px;
  }
  .ins-cmcloser__display {
    font-size: 24px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .ins-cmcloser__sub {
    margin-top: 8px;
    font-size: 12.5px;
    line-height: 1.5;
  }
  .ins-cmcloser__link {
    display: inline-block;
    margin-top: 12px;
    font-size: 10px;
    letter-spacing: 0.14em;
    padding-bottom: 4px;
  }
}
`;

/**
 * CommunityCloser — "permission to leave" for /community: 44px display, a
 * one-line dek, and the route's single red CTA out to the subreddit.
 *
 * Replaces the broadsheet's dark two-link CTA band. One destination only —
 * the Instrument closer takes exactly one action, and "open the sub" covers
 * "start a thread" once you're there.
 *
 * Server component — no state; plain <style>, not styled-jsx (which would
 * not scope onto the anchor anyway).
 */
export default function CommunityCloser() {
  return (
    <section className="ins-cmcloser" aria-label="Closing note">
      <div>
        <p className="ins-cmcloser__display">The thread is always open.</p>
        <p className="ins-cmcloser__sub">
          Bring your real numbers and your bad takes. You&rsquo;ll get honesty
          back, and nobody there is selling you anything.
        </p>
      </div>
      <a
        href="https://www.reddit.com/r/JustBuyVEQT/"
        target="_blank"
        rel="noopener noreferrer"
        className="ins-cmcloser__link"
      >
        Join the discussion <span aria-hidden>→</span>
      </a>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
