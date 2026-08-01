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
/* The right-hand note is a SOURCING LINE, not a label — it explains how the
   feed was gathered rather than naming a thing — so Turn 8 moves it to
   caption grammar (12px, w500, hairline tracking, sentence case) and the
   copy in the JSX is re-cased to match. Same split the ConditionsBand rail
   makes between its caps verdict and its sentence-case note. */
.ins-cmrail__note {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
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
  /* The rail STATEMENT stays a caps statement — it is the module's verdict,
     the one place the Instrument shouts on purpose. 10px/0.1em is the same
     mobile rail setting ConditionsBand executed, so the two rails print
     alike at 390. */
  .ins-cmrail__copy {
    font-size: 10px;
    letter-spacing: 0.1em;
  }
  .ins-cmrail__note--desktop {
    display: none;
  }
  /* Short form of the same sourcing line — still a caption, so it inherits
     the 12px/0.01em base and only changes its alignment. */
  .ins-cmrail__note--mobile {
    display: block;
    margin-left: 0;
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
      {/* Sentence case since Turn 8 — these two are captions (how we know),
          not labels. Same words, same meaning, different case. */}
      <span className="ins-cmrail__note ins-cmrail__note--desktop">
        Sourced from public threads · no accounts tracked
      </span>
      <span className="ins-cmrail__note ins-cmrail__note--mobile">
        Public threads · no accounts tracked
      </span>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
