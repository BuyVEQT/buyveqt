import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";
import LearnHero from "./LearnHero";
import MarqueeBout from "./MarqueeBout";
import CourseOne from "./CourseOne";
import CourseTwo from "./CourseTwo";
import FullIndex from "./FullIndex";
import SyllabusRail from "./SyllabusRail";
import LearnCloser from "./LearnCloser";
import {
  COURSE_ONE_SLUGS,
  COURSE_TWO_SLUGS,
  MARQUEE_SLUG,
  pickBySlug,
  toEntry,
  totalMinutes,
} from "./learn-syllabus";

interface LearnContentProps {
  articles: ArticleFrontmatter[];
}

/**
 * /learn index — the Instrument (artboard 6c).
 *
 * Module order:
 *   LearnHero     — kicker · "Learn the boring fund." · dek
 *   MarqueeBout   — ink panel + red CTA, the VEQT × XEQT read
 *   CourseOne     — editor column + ordinal rows 01–03
 *   CourseTwo     — the accounts, 04–06
 *   FullIndex     — filter tabs + two-column ruled index (client)
 *   SyllabusRail  — read in order
 *   LearnCloser   — Course One's running time + start at 01
 *
 * Every number on the page (dispatch count, per-article minutes, course
 * totals, the archive remainder) is derived from the registry passed in —
 * nothing is transcribed from the mock.
 */
export default function LearnContent({ articles }: LearnContentProps) {
  const marqueeSource = articles.find((a) => a.slug === MARQUEE_SLUG);
  const marquee = marqueeSource ? toEntry(marqueeSource) : null;

  const courseOne = pickBySlug(articles, COURSE_ONE_SLUGS);
  const courseTwo = pickBySlug(articles, COURSE_TWO_SLUGS);
  const courseOneMinutes = totalMinutes(courseOne);
  const courseTwoMinutes = totalMinutes(courseTwo);

  const index = articles.map(toEntry);

  return (
    <>
      <LearnHero count={articles.length} />

      {marquee && <MarqueeBout entry={marquee} />}

      {courseOne.length > 0 && (
        <CourseOne entries={courseOne} minutes={courseOneMinutes} />
      )}

      {courseTwo.length > 0 && (
        <CourseTwo
          entries={courseTwo}
          minutes={courseTwoMinutes}
          startOrdinal={courseOne.length + 1}
        />
      )}

      <FullIndex entries={index} count={articles.length} />

      {/* Guided paths — the only inbound route to /learn/path (and its
          six /learn/path/[id] pages) now that the old PathsGrid is gone.
          One ruled row in the archive grammar, no new module. */}
      <div className="lrn-paths">
        <Link href="/learn/path" className="lrn-paths__row">
          <span className="lrn-paths__body">
            <span className="lrn-paths__kicker">
              Prefer a guided route? · Six curated paths
            </span>
            <span className="lrn-paths__title">
              Reading paths, by goal — new investor to FIRE
            </span>
          </span>
          <span className="lrn-paths__arrow" aria-hidden>
            →
          </span>
        </Link>
        <style
          dangerouslySetInnerHTML={{
            __html: `
.lrn-paths__row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: center;
  padding: 14px 0;
  border-top: 1px solid var(--ins-ink);
  border-bottom: 1px solid var(--ins-ink);
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: padding-left 0.15s;
  min-height: 44px;
}
.lrn-paths__row:hover {
  padding-left: 8px;
}
.lrn-paths__kicker {
  display: block;
  font-family: var(--ins-font);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.lrn-paths__title {
  display: block;
  font-family: var(--ins-font);
  font-size: 21px;
  font-weight: 600;
  color: var(--ins-ink);
  margin-top: 4px;
}
.lrn-paths__arrow {
  font-size: 18px;
  color: var(--ins-ink);
}
.lrn-paths__row:hover .lrn-paths__arrow {
  color: var(--ins-signal);
}
@media (max-width: 639px) {
  .lrn-paths__title {
    font-size: 15px;
  }
}
`,
          }}
        />
      </div>

      <SyllabusRail />

      {courseOne.length > 0 && (
        <LearnCloser
          minutes={courseOneMinutes}
          commentaryCount={articles.length - courseOne.length}
          firstSlug={courseOne[0].slug}
        />
      )}
    </>
  );
}
