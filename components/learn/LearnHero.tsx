interface LearnHeroProps {
  /** Number of articles in the library, surfaced in the eyebrow + lede. */
  articleCount: number;
}

/**
 * V2 compact masthead: stamp row (archive count + date), then a 2-col
 * grid with thick ink top rule and hairline bottom rule containing
 * the "Learn." italic h1 and a short lede.
 *
 * Replaces the verbose 4-way navigation explainer with a brief deck
 * that defers to the surfaces below (FlagshipPromo / WhereToStart /
 * EditorsPicks / Archive).
 */
export default function LearnHero({ articleCount }: LearnHeroProps) {
  const dateStr = new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="learn-hero-v2">
      <div className="learn-hero-v2__top">
        <span className="ed-stamp">
          The archive · {articleCount} dispatches · Updated weekly
        </span>
        <span className="ed-stamp" style={{ color: "var(--ink-mute)" }}>
          {dateStr}
        </span>
      </div>
      <div className="learn-hero-v2__lockup">
        <h1 className="ed-display-italic learn-hero-v2__h1">Learn.</h1>
        <p className="ed-body learn-hero-v2__lede">
          {articleCount} dispatches on owning VEQT well. Pick a path, read
          what the editor recommends, or browse the full archive.
        </p>
      </div>

      <style jsx global>{`
        .learn-hero-v2 {
          padding: 26px 0 22px;
        }
        .learn-hero-v2__top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
          padding-bottom: 10px;
        }
        .learn-hero-v2__lockup {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          padding: 18px 0 8px;
          border-top: 3px solid var(--ink);
          border-bottom: 1px solid var(--ink);
          align-items: end;
        }
        @media (min-width: 720px) {
          .learn-hero-v2__lockup {
            grid-template-columns: auto 1fr;
            gap: 40px;
            padding: 22px 0 12px;
          }
        }
        .learn-hero-v2__h1 {
          font-size: clamp(3rem, 8vw, 6rem);
          line-height: 1;
          letter-spacing: -0.035em;
          margin: 0;
          color: var(--ink);
          white-space: nowrap;
        }
        .learn-hero-v2__lede {
          font-size: clamp(15px, 1.6vw, 17.5px);
          line-height: 1.55;
          color: var(--ink-soft);
          margin: 0;
          max-width: 52ch;
          padding-bottom: 8px;
        }
      `}</style>
    </header>
  );
}
