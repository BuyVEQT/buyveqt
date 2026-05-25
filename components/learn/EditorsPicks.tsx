import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";
import { EDITORS_PICKS } from "@/lib/editors-picks";
import { isInteractive } from "@/lib/interactive-slugs";

interface EditorsPicksProps {
  articles: ArticleFrontmatter[];
}

/**
 * V2 editor's picks — 3-up grid with "Dispatch №" editorial framing.
 *
 * Each card carries: dispatch numeral (02/03/04) + reading-time eyebrow,
 * Fraunces title, italic display excerpt, optional "Interactive tool"
 * pill, and a vermilion "Read →" stamp at the bottom.
 */
export default function EditorsPicks({ articles }: EditorsPicksProps) {
  const picks = EDITORS_PICKS
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is ArticleFrontmatter => !!a);

  if (picks.length === 0) return null;

  return (
    <section className="discover-v2">
      <div className="discover-v2__head">
        <div>
          <div className="ed-stamp">From the editor</div>
          <h2 className="ed-display discover-v2__h2">
            If you only read{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>three</em>{" "}
            things this month.
          </h2>
        </div>
        <p className="ed-caption discover-v2__deck">
          Hand-picked dispatches we think every VEQT investor should have
          read at least once.
        </p>
      </div>
      <div className="discover-v2__grid discover-v2__grid--picks">
        {picks.map((a, i) => {
          const tool = isInteractive(a.slug);
          // Dispatch numbering starts at 02 (01 is the flagship)
          const dispatchNo = String(i + 2).padStart(2, "0");
          return (
            <Link key={a.slug} href={`/learn/${a.slug}`} className="epick">
              <div className="epick__head">
                <span className="ed-stamp">Dispatch № {dispatchNo}</span>
                <span
                  className="ed-stamp"
                  style={{ color: "var(--ink-mute)" }}
                >
                  {a.readingTime} read
                </span>
              </div>
              <h3 className="ed-display epick__title">{a.title}</h3>
              <p className="ed-display-italic epick__excerpt">
                {a.excerpt || a.description}
              </p>
              {tool && (
                <span className="epick__tool">⚙ Interactive tool</span>
              )}
              <div className="epick__foot">
                <span className="ed-stamp epick__cta">Read →</span>
              </div>
            </Link>
          );
        })}
      </div>

      <style jsx global>{`
        .epick {
          display: flex;
          flex-direction: column;
          padding: 20px 22px 18px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-radius: 18px;
          text-decoration: none;
          color: inherit;
          min-height: 220px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .epick:hover {
          border-color: var(--ink);
          transform: translateY(-2px);
        }
        .epick__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 14px;
        }
        .epick__title {
          font-size: clamp(1.15rem, 1.9vw, 1.4rem);
          line-height: 1.2;
          letter-spacing: -0.012em;
          color: var(--ink);
          margin: 0 0 10px;
        }
        .epick__excerpt {
          font-size: 14px;
          line-height: 1.45;
          color: var(--ink-soft);
          margin: 0 0 14px;
          flex: 1;
        }
        .epick__tool {
          display: inline-block;
          align-self: flex-start;
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--stamp);
          border: 1px solid var(--stamp);
          padding: 3px 8px;
          border-radius: 999px;
          margin-bottom: 12px;
        }
        .epick__foot {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid var(--rule-soft);
        }
        .epick__cta {
          color: var(--stamp);
        }
      `}</style>
    </section>
  );
}
