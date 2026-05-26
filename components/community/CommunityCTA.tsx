"use client";

import Card from "@/components/ui/Card";

/**
 * V2 dark-band community CTA — same construction as the Almanac and the
 * inside-veqt Methodology slab. Vermilion top rule, 2-col on `>= 760px`
 * with the messaging on the left and stacked reddit links on the right.
 */
export default function CommunityCTA() {
  return (
    <Card dark padding={0}>
      <section className="cm-cta">
        <div className="cm-cta__rule" aria-hidden />
        <div className="cm-cta__grid">
          <div>
            <span
              className="ed-stamp"
              style={{ color: "var(--stamp)" }}
            >
              Take part
            </span>
            <h3 className="ed-display-italic cm-cta__h3">
              Got a question, a milestone, or a panic to share?
            </h3>
            <p className="cm-cta__body">
              The subreddit is where holders talk to each other unsupervised.
              Bring your real numbers; bring your bad takes; you&apos;ll get
              honesty back.
            </p>
          </div>
          <div className="cm-cta__actions">
            <a
              href="https://www.reddit.com/r/JustBuyVEQT/"
              target="_blank"
              rel="noopener noreferrer"
              className="cm-cta__primary"
            >
              <span>Open r/JustBuyVEQT</span>
              <span aria-hidden className="cm-cta__primary-arrow">
                →
              </span>
            </a>
            <a
              href="https://www.reddit.com/r/JustBuyVEQT/submit"
              target="_blank"
              rel="noopener noreferrer"
              className="cm-cta__secondary"
            >
              Start a new thread →
            </a>
          </div>
        </div>

        <style jsx>{`
          .cm-cta {
            position: relative;
            padding: 36px 32px;
          }
          .cm-cta__rule {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--stamp);
          }
          .cm-cta__grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 28px;
            align-items: end;
          }
          @media (min-width: 760px) {
            .cm-cta__grid {
              grid-template-columns: 1.5fr 1fr;
              gap: 48px;
            }
          }
          .cm-cta__h3 {
            font-size: clamp(1.8rem, 3vw, 2.4rem);
            line-height: 1.1;
            color: var(--band-paper);
            margin: 12px 0 14px;
            max-width: 26ch;
          }
          .cm-cta__body {
            font-family: var(--font-serif);
            font-size: 15px;
            line-height: 1.55;
            color: rgba(246, 239, 220, 0.78);
            margin: 0;
            max-width: 50ch;
          }
          .cm-cta__actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
          @media (min-width: 760px) {
            .cm-cta__actions {
              align-items: flex-end;
            }
          }
          .cm-cta__primary {
            display: inline-flex;
            align-items: center;
            padding: 14px 22px;
            background: var(--stamp);
            color: var(--band-paper);
            border-radius: 999px;
            font-family: var(--font-sans);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            text-decoration: none;
            transition: transform 0.18s, background 0.18s;
          }
          .cm-cta__primary:hover {
            background: color-mix(in oklab, var(--stamp) 85%, white);
            transform: translateX(3px);
          }
          .cm-cta__primary-arrow {
            margin-left: 12px;
          }
          .cm-cta__secondary {
            font-family: var(--font-sans);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: rgba(246, 239, 220, 0.7);
            text-decoration: none;
            border-bottom: 1px solid rgba(246, 239, 220, 0.35);
            padding-bottom: 4px;
          }
          .cm-cta__secondary:hover {
            color: var(--band-paper);
          }
        `}</style>
      </section>
    </Card>
  );
}
