import SectionLabel from "@/components/ui/SectionLabel";
import Lede from "@/components/ui/Lede";

interface LearnHeroProps {
  /** Number of articles in the library, surfaced in the eyebrow + lede. */
  articleCount: number;
}

/**
 * Index hero per v2 spec: kicker "The archive · N dispatches", italic
 * h1 "Learn.", drop-cap lede explaining the four ways to navigate.
 */
export default function LearnHero({ articleCount }: LearnHeroProps) {
  return (
    <header className="learn-hero">
      <div className="learn-hero__title">
        <SectionLabel>The archive · {articleCount} dispatches</SectionLabel>
        <h1
          className="ed-display-italic"
          style={{
            fontSize: "clamp(2.5rem, 7vw, 5.25rem)",
            lineHeight: 1,
            margin: "12px 0 0",
            color: "var(--ink)",
            letterSpacing: "-0.028em",
          }}
        >
          Learn.
        </h1>
      </div>
      <Lede style={{ fontSize: "1.125rem", maxWidth: "50ch" }}>
        {articleCount} dispatches on owning VEQT well. Pick a path, scan
        editor&apos;s picks, filter by level and time, or browse the archive
        end-to-end. The choice of what to read first matters more than the
        choice of which one to start with.
      </Lede>
    </header>
  );
}
