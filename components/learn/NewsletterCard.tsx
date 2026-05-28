"use client";

interface NewsletterCardProps {
  /**
   * Tightens padding and font sizes for inline use below an article body.
   * The dark slab, vermilion rule, pulled quote, and bullet list all stay —
   * only the surrounding chrome compresses.
   */
  compact?: boolean;
}

/**
 * V2 NewsletterCard — dark publication card with vermilion top rule.
 *
 * Layout:
 *   Top stamps:   "The weekly dispatch"  ·  "Edition N · Shipped …"
 *   Hairline rule
 *   2-col body (>= 760px, 1.45fr/1fr):
 *     Left:  italic h2 + body copy + 3-bullet "what's inside" list
 *     Right: pulled quote with vermilion left border + edition byline
 *   Email + "Join N readers" CTA row (single row >= 560px, stacks below)
 *   Tiny legal caption
 *
 * Visual-only — wire the submit handler upstream when a backend exists.
 */
export default function NewsletterCard({ compact = false }: NewsletterCardProps = {}) {
  return (
    <section className={`news-v2 ${compact ? "news-v2--compact" : ""}`}>
      <div className="news-v2__top">
        <span className="ed-stamp news-v2__masthead">
          The weekly dispatch
        </span>
        <span className="ed-stamp news-v2__edition">
          Edition 47 · Shipped Sun
        </span>
      </div>
      <div className="news-v2__rule" />

      <div className="news-v2__body">
        <div className="news-v2__lead">
          <h2 className="ed-display-italic news-v2__h2">
            One letter,{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>
              every Sunday.
            </em>
          </h2>
          <p className="ed-body news-v2__copy">
            A weekly read for the VEQT holder who hasn&apos;t given up on
            understanding what they own. ~600 words. Independent. No
            affiliate links. Unsubscribe in one click.
          </p>
          <ul className="news-v2__bullets">
            <li>
              <span className="news-v2__check" aria-hidden>
                ✓
              </span>{" "}
              The week&apos;s new dispatches
            </li>
            <li>
              <span className="news-v2__check" aria-hidden>
                ✓
              </span>{" "}
              One chart that explains the week
            </li>
            <li>
              <span className="news-v2__check" aria-hidden>
                ✓
              </span>{" "}
              A line worth thinking about
            </li>
          </ul>
        </div>

        <aside className="news-v2__quote">
          <span className="news-v2__quote-mark" aria-hidden>
            &ldquo;
          </span>
          <p className="news-v2__quote-body">
            Diversification is the only free lunch in investing. Take seconds.
          </p>
          <p className="news-v2__quote-byline">
            From <em>Edition 46 · On Canadian home bias</em>
          </p>
        </aside>
      </div>

      <form
        className="news-v2__form"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Subscribe to the weekly dispatch"
      >
        <label className="news-v2__field">
          <span className="news-v2__sr">Email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            aria-label="Email address"
          />
        </label>
        <button type="submit" className="news-v2__submit">
          Join 4,238 readers
          <span aria-hidden className="news-v2__submit-arrow">
            →
          </span>
        </button>
      </form>

      <div className="news-v2__legal">
        <span className="ed-caption">
          Independent. We don&apos;t share your email. Unsubscribe in one click.
        </span>
      </div>

      <style jsx global>{`
        .news-v2 {
          margin-top: 28px;
          padding: 28px 32px 26px;
          background: var(--band-ink);
          color: var(--band-paper);
          border-radius: 18px;
          position: relative;
          overflow: hidden;
        }
        .news-v2--compact {
          margin-top: 16px;
          padding: 22px 24px 20px;
          border-radius: 14px;
        }
        .news-v2--compact .news-v2__h2 {
          font-size: clamp(1.4rem, 2.4vw, 1.8rem);
        }
        .news-v2--compact .news-v2__body {
          gap: 18px;
          margin-bottom: 18px;
        }
        .news-v2::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--stamp);
        }
        .news-v2__top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        .news-v2__masthead {
          color: var(--band-paper);
          letter-spacing: 0.24em;
        }
        .news-v2__edition {
          color: rgba(246, 239, 220, 0.55);
        }
        .news-v2__rule {
          height: 1px;
          background: rgba(246, 239, 220, 0.22);
          margin: 12px 0 22px;
        }

        .news-v2__body {
          display: grid;
          grid-template-columns: 1fr;
          gap: 26px;
          align-items: start;
          margin-bottom: 22px;
        }
        @media (min-width: 760px) {
          .news-v2__body {
            grid-template-columns: 1.45fr 1fr;
            gap: 36px;
          }
        }
        .news-v2__h2 {
          font-size: clamp(1.7rem, 3vw, 2.3rem);
          line-height: 1.1;
          color: var(--band-paper);
          margin: 0 0 14px;
          max-width: 14ch;
        }
        .news-v2__copy {
          font-size: 14.5px;
          line-height: 1.55;
          color: rgba(246, 239, 220, 0.78);
          margin: 0 0 14px;
          max-width: 56ch;
        }
        .news-v2__bullets {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .news-v2__bullets li {
          font-family: var(--font-serif);
          font-size: 14px;
          color: rgba(246, 239, 220, 0.85);
          display: flex;
          gap: 10px;
          align-items: baseline;
        }
        .news-v2__check {
          color: var(--stamp);
          font-weight: 700;
        }

        .news-v2__quote {
          background: rgba(246, 239, 220, 0.06);
          border-left: 3px solid var(--stamp);
          padding: 18px 20px 16px;
          border-radius: 0 12px 12px 0;
          position: relative;
        }
        .news-v2__quote-mark {
          position: absolute;
          top: -6px;
          left: 12px;
          font-family: var(--font-display);
          font-size: 48px;
          line-height: 1;
          color: var(--stamp);
          opacity: 0.6;
        }
        .news-v2__quote-body {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 16px;
          line-height: 1.5;
          color: var(--band-paper);
          margin: 14px 0 8px;
        }
        .news-v2__quote-byline {
          font-family: var(--font-sans);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(246, 239, 220, 0.55);
          margin: 0;
        }
        .news-v2__quote-byline em {
          color: rgba(246, 239, 220, 0.75);
          text-transform: none;
          font-weight: 500;
          letter-spacing: 0.02em;
          font-family: var(--font-serif);
          font-style: italic;
        }

        .news-v2__form {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @media (min-width: 560px) {
          .news-v2__form {
            grid-template-columns: 1fr auto;
          }
        }
        .news-v2__field {
          display: block;
        }
        .news-v2__sr {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        .news-v2__field input {
          appearance: none;
          width: 100%;
          padding: 14px 16px;
          background: rgba(246, 239, 220, 0.06);
          border: 1px solid rgba(246, 239, 220, 0.18);
          border-radius: 999px;
          font-family: var(--font-serif);
          /* iOS Safari auto-zooms anything < 16px; floor on mobile, original 15px elsewhere. */
          font-size: max(16px, 15px);
          color: var(--band-paper);
          outline: none;
          transition: border-color 0.18s, background 0.18s;
        }
        .news-v2__field input:focus {
          border-color: var(--stamp);
          background: rgba(246, 239, 220, 0.10);
        }
        .news-v2__field input::placeholder {
          color: rgba(246, 239, 220, 0.4);
        }
        .news-v2__submit {
          appearance: none;
          padding: 14px 22px;
          background: var(--stamp);
          color: var(--band-paper);
          border: 0;
          border-radius: 999px;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          white-space: nowrap;
          transition: background 0.18s, transform 0.18s;
        }
        .news-v2__submit:hover {
          background: color-mix(in oklab, var(--stamp) 85%, white);
          transform: translateX(2px);
        }
        .news-v2__submit-arrow {
          color: var(--band-paper);
          font-size: 14px;
        }

        .news-v2__legal {
          margin-top: 14px;
        }
        .news-v2__legal a {
          color: rgba(246, 239, 220, 0.7);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .news-v2__legal a:hover {
          color: var(--band-paper);
        }
      `}</style>
    </section>
  );
}
