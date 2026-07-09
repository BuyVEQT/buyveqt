import type { Region } from "@/lib/useRegions";

/** Canonical sleeve names — matches LeaderSleeveCard / FollowerSleeveRow
 *  so the editorial sentence above the sleeves reads with the same
 *  geographic vocabulary as the cards below it. */
const REGION_LABEL: Record<string, string> = {
  VUN: "United States",
  VCN: "Canada",
  VIU: "Developed ex-NA",
  VEE: "Emerging Markets",
};

interface InSentenceHeadlineProps {
  leader: Region;
  others: Region[];
  fundChangePct: number;
}

function makeHeadline(
  leader: Region,
  others: Region[],
  fundChangePct: number
): { body: string; trailer: string } {
  const contrib = leader.contribution ?? 0;
  const sign = contrib >= 0 ? "+" : "−";
  const contribStr = `${sign}${Math.abs(contrib).toFixed(2)} pp`;
  const verb =
    contrib >= 0
      ? fundChangePct >= 0
        ? "carried"
        : "softened the drop on"
      : fundChangePct >= 0
      ? "held back"
      : "led the drop on";

  const dirs = others.map((r) => (r.changePercent ?? 0) >= 0);
  const upN = dirs.filter(Boolean).length;
  const downN = dirs.length - upN;

  let trailer: string;
  if (contrib >= 0 && upN === others.length) {
    trailer = "All four sleeves moved with it.";
  } else if (contrib < 0 && downN === others.length) {
    trailer = "All four sleeves moved with it.";
  } else if (upN === others.length || downN === others.length) {
    trailer = "The other three followed.";
  } else {
    trailer = "The other sleeves split.";
  }

  const leaderName = REGION_LABEL[leader.ticker] ?? leader.fullName;

  return {
    body: `${leaderName} ${verb} today · ${contribStr} of contribution.`,
    trailer,
  };
}

/**
 * Editorial sentence above the region sleeves — a vermilion-outlined
 * "IN A SENTENCE" pill on the left, italic Fraunces sentence to the right.
 * Single row on desktop, wraps below the pill on narrow viewports.
 */
export default function InSentenceHeadline({
  leader,
  others,
  fundChangePct,
}: InSentenceHeadlineProps) {
  const headline = makeHeadline(leader, others, fundChangePct);

  return (
    <>
      <p className="ledger__sentence">
        <span className="ledger__sentence-pill" aria-label="In a sentence">
          In a sentence
        </span>
        <span className="ledger__sentence-body">
          <em>{headline.body}</em>{" "}
          <span className="ledger__sentence-trailer">{headline.trailer}</span>
        </span>
      </p>

      <style jsx>{`
        .ledger__sentence {
          display: flex;
          gap: 14px;
          margin: 0;
          padding: 0;
          font-family: var(--font-serif);
          font-size: clamp(15px, 1.35vw, 17px);
          line-height: 1.5;
          color: var(--ink);
          align-items: center;
          flex-wrap: wrap;
        }
        .ledger__sentence-pill {
          display: inline-flex;
          align-items: center;
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--stamp);
          border: 1px solid var(--stamp);
          padding: 5px 11px;
          border-radius: 999px;
          background: transparent;
          flex-shrink: 0;
          white-space: nowrap;
          line-height: 1;
        }
        .ledger__sentence-body {
          min-width: 0;
          flex: 1 1 auto;
        }
        .ledger__sentence-body em {
          font-style: italic;
          font-weight: 500;
          color: var(--ink);
        }
        .ledger__sentence-trailer {
          color: var(--ink-mute);
          font-style: italic;
        }
        @media (max-width: 560px) {
          .ledger__sentence {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </>
  );
}
