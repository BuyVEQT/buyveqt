import type { Region } from "@/lib/useRegions";

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

  return {
    body: `${leader.fullName} ${verb} today — ${contribStr} of contribution.`,
    trailer,
  };
}

/**
 * Editorial sentence above the region sleeves.
 * "In a sentence  United States carried today — +0.30 pp of contribution."
 */
export default function InSentenceHeadline({
  leader,
  others,
  fundChangePct,
}: InSentenceHeadlineProps) {
  const headline = makeHeadline(leader, others, fundChangePct);

  return (
    <>
      <p className="ledger__headline">
        <span className="ed-stamp ledger__headline-stamp">In a sentence</span>
        <span>
          <em>{headline.body}</em>{" "}
          <span className="ledger__headline-trailer">{headline.trailer}</span>
        </span>
      </p>

      <style jsx>{`
        .ledger__headline {
          display: flex;
          gap: 16px;
          margin: 16px 0 22px;
          font-family: var(--font-serif);
          font-size: clamp(15px, 1.6vw, 17px);
          line-height: 1.5;
          color: var(--ink);
          align-items: baseline;
          flex-wrap: wrap;
        }
        .ledger__headline em {
          font-style: italic;
          font-weight: 500;
        }
        .ledger__headline-stamp {
          color: var(--stamp);
          flex-shrink: 0;
          padding-top: 2px;
        }
        .ledger__headline-trailer {
          color: var(--ink-mute);
          font-style: italic;
        }
        @media (max-width: 560px) {
          .ledger__headline {
            flex-direction: column;
            gap: 6px;
          }
        }
      `}</style>
    </>
  );
}
