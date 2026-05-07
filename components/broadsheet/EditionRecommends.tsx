import Link from "next/link";

export type RecommendsZone = "typical" | "notable" | "unusual" | "rare";
export type RecommendsDirection = "up" | "down" | "flat";

interface EditionRecommendsProps {
  zone: RecommendsZone;
  /**
   * Sign of today's move. The recommendation copy and the linked article
   * branch on this so a notable +1.7% day doesn't get sell-the-rip framing
   * and a rare −3% day doesn't get "stay invested for the upside" framing.
   * Pass "flat" (or omit) when the move is essentially zero.
   */
  direction?: RecommendsDirection;
}

interface ZoneCopy {
  zoneLabel: string;
  verdict: string;
  href: string;
  linkLabel: string;
}

const COPY: Record<RecommendsZone, Record<RecommendsDirection, ZoneCopy>> = {
  typical: {
    up: {
      zoneLabel: "Typical",
      verdict: "Hold. Contribute on schedule. Today is noise.",
      href: "/learn/why-timing-the-market-fails",
      linkLabel: "Why timing the market fails",
    },
    down: {
      zoneLabel: "Typical",
      verdict: "Hold. Contribute on schedule. Today is noise.",
      href: "/learn/why-timing-the-market-fails",
      linkLabel: "Why timing the market fails",
    },
    flat: {
      zoneLabel: "Typical",
      verdict: "Hold. Contribute on schedule. Today is noise.",
      href: "/learn/why-timing-the-market-fails",
      linkLabel: "Why timing the market fails",
    },
  },
  notable: {
    up: {
      zoneLabel: "Notable · Up",
      verdict:
        "Hold. The green is normal noise — don't chase it; don't add ahead of plan.",
      href: "/learn/lump-sum-vs-dca",
      linkLabel: "Lump sum vs. DCA",
    },
    down: {
      zoneLabel: "Notable · Down",
      verdict: "Hold. The red is normal noise — today's not the day to flinch.",
      href: "/learn/lump-sum-vs-dca",
      linkLabel: "Lump sum vs. DCA",
    },
    flat: {
      zoneLabel: "Notable",
      verdict: "Hold. Today's move is inside the normal range.",
      href: "/learn/lump-sum-vs-dca",
      linkLabel: "Lump sum vs. DCA",
    },
  },
  unusual: {
    up: {
      zoneLabel: "Unusual · Up",
      verdict:
        "Hold. Big green days draw new money in late. Stay on schedule.",
      href: "/learn/why-stocks-go-up",
      linkLabel: "Why stocks go up (over decades)",
    },
    down: {
      zoneLabel: "Unusual · Down",
      verdict: "Hold. Resist the urge to check again before tomorrow.",
      href: "/learn/veqt-is-down",
      linkLabel: "VEQT is down — what now?",
    },
    flat: {
      zoneLabel: "Unusual",
      verdict: "Hold. An unusual day, but the next one will probably be calm.",
      href: "/learn/passive-investing-behavioral-edge",
      linkLabel: "The behavioural edge of passive investing",
    },
  },
  rare: {
    up: {
      zoneLabel: "Rare · Up",
      verdict:
        "Hold. Days like this are why you stay invested through the dull ones.",
      href: "/learn/why-stocks-go-up",
      linkLabel: "Why stocks go up (over decades)",
    },
    down: {
      zoneLabel: "Rare · Down",
      verdict:
        "Hold. Days like this are exactly what your time horizon is for.",
      href: "/learn/veqt-is-down",
      linkLabel: "VEQT is down — what now?",
    },
    flat: {
      zoneLabel: "Rare",
      verdict:
        "Hold. Days this big don't happen often — they're not your cue to act.",
      href: "/learn/passive-investing-behavioral-edge",
      linkLabel: "The behavioural edge of passive investing",
    },
  },
};

export default function EditionRecommends({
  zone,
  direction = "flat",
}: EditionRecommendsProps) {
  const copy = COPY[zone][direction];
  return (
    <aside className="bs-rec-board">
      <span className="bs-stamp bs-rec-board__head">
        Today&rsquo;s edition recommends
        <span className="bs-rec-board__zone">{copy.zoneLabel}</span>
      </span>
      <h3 className="bs-rec-board__verdict">{copy.verdict}</h3>
      <Link href={copy.href} className="bs-rec-board__read">
        Read &rarr; {copy.linkLabel}
      </Link>
    </aside>
  );
}
