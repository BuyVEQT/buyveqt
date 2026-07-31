const css = `
.ins-cmrail {
  border: 1px solid var(--ins-ink, #111111);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 11px 22px;
  font-family: var(--ins-font);
  color: var(--ins-ink, #111111);
}
.ins-cmrail__sq {
  width: 9px;
  height: 9px;
  background: var(--ins-ink, #111111);
  flex: none;
}
.ins-cmrail__copy {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  /* No text-transform — the copy is pre-uppercased so punctuation and any
     future glyph survive the pass unchanged. */
}
.ins-cmrail__note {
  margin-left: auto;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--ins-gray-600);
  text-align: right;
}
.ins-cmrail__note--mobile {
  display: none;
}

@media (max-width: 640px) {
  .ins-cmrail {
    gap: 10px;
    padding: 9px 16px;
  }
  .ins-cmrail__sq {
    width: 7px;
    height: 7px;
  }
  .ins-cmrail__copy {
    font-size: 9px;
    letter-spacing: 0.12em;
  }
  .ins-cmrail__note--desktop {
    display: none;
  }
  .ins-cmrail__note--mobile {
    display: block;
    margin-left: 0;
    font-size: 7.5px;
    letter-spacing: 0.1em;
    text-align: left;
  }
}
`;

/**
 * PulseVerdict — the route's one verdict rail (Instrument constant: 1px ink
 * bordered row, 9px square, uppercase w800 statement, right-hand gray note).
 *
 * The square stays ink, not red: nothing on this page is an alarm, and the
 * viewport's red budget belongs to the closer's CTA directly beneath it.
 *
 * Server component — no state; plain <style>, not styled-jsx.
 */
export default function PulseVerdict() {
  return (
    <section className="ins-cmrail" aria-label="The verdict">
      <span className="ins-cmrail__sq" aria-hidden="true" />
      <span className="ins-cmrail__copy">
        NOBODY HERE KNOWS THE FUTURE EITHER &mdash; THAT&rsquo;S THE POINT
      </span>
      <span className="ins-cmrail__note ins-cmrail__note--desktop">
        SOURCED FROM PUBLIC THREADS · NO ACCOUNTS TRACKED
      </span>
      <span className="ins-cmrail__note ins-cmrail__note--mobile">
        PUBLIC THREADS · NO ACCOUNTS TRACKED
      </span>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
