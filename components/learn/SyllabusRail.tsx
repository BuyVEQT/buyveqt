const css = `
.lrn-rail {
  border: 1px solid var(--ins-ink);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 22px;
  font-family: var(--ins-font);
  color: var(--ins-ink);
}
.lrn-rail__sq {
  width: 9px;
  height: 9px;
  background: var(--ins-ink);
  flex: none;
}
.lrn-rail__copy {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.lrn-rail__note {
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  text-align: right;
}

@media (max-width: 640px) {
  .lrn-rail {
    gap: 8px;
    padding: 11px 14px;
  }
  .lrn-rail__sq {
    width: 8px;
    height: 8px;
  }
  .lrn-rail__copy {
    font-size: 10px;
    letter-spacing: 0.1em;
  }
  .lrn-rail__note {
    font-size: 10px;
    letter-spacing: 0.06em;
  }
  .lrn-rail__long {
    display: none;
  }
}
`;

/**
 * The syllabus rail — artboard 6c. Ink square, the standing instruction,
 * and the cadence note on the right. Mobile drops the long halves of both
 * strings rather than shrinking them past legibility.
 *
 * Server-safe: no client state; plain <style>, not styled-jsx.
 */
export default function SyllabusRail() {
  return (
    <section className="lrn-rail" aria-label="How to read the syllabus">
      <span className="lrn-rail__sq" aria-hidden />
      <span className="lrn-rail__copy">
        Read in order
        <span className="lrn-rail__long"> — the syllabus is the product</span>
      </span>
      <span className="lrn-rail__note">
        New <span className="lrn-rail__long">dispatch </span>every Thursday
      </span>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
