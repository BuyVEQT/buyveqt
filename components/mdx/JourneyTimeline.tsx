"use client";

interface TimelineCard {
  period: string;
  title: string;
  description: string;
  costLabel: string;
  balanceLabel: string;
}

const FOREX_STEPS: TimelineCard[] = [
  {
    period: "Month 1\u20133",
    title: "The Honeymoon",
    description:
      "Buy courses, paper trade, feel confident. Spend $500\u2013$2,000 on education.",
    costLabel: "$1,500 spent",
    balanceLabel: "$0 (demo)",
  },
  {
    period: "Month 4\u20136",
    title: "The Wake-Up Call",
    description:
      "Go live. First wins feel amazing. Then revenge trading wipes out gains.",
    costLabel: "$500 lost",
    balanceLabel: "$1,600 of $2,000",
  },
  {
    period: "Month 7\u20139",
    title: "Strategy Hopping",
    description:
      "Try scalping, swing, signals. Each new strategy costs money and time.",
    costLabel: "$99/mo signals",
    balanceLabel: "$1,200",
  },
  {
    period: "Month 10\u201312",
    title: "The Crossroads",
    description:
      "Down ~$2,200 in direct costs, ~$8,600 in time. Most quit here.",
    costLabel: "$4,000+ total",
    balanceLabel: "$1,800 of $3,000",
  },
];

const VEQT_STEPS: TimelineCard[] = [
  {
    period: "Month 1",
    title: "Setup Complete",
    description:
      "Open account, enable auto-deposit. Total time: 30 minutes.",
    costLabel: "Invested: $800",
    balanceLabel: "Value: $803",
  },
  {
    period: "Month 4",
    title: "Growing Quietly",
    description:
      "Auto-deposits continue. You haven\u2019t thought about it once.",
    costLabel: "Invested: $3,200",
    balanceLabel: "Value: $3,310",
  },
  {
    period: "Month 7",
    title: "Life Continues",
    description:
      "Market dipped in month 5. You didn\u2019t notice. DCA bought the dip for you.",
    costLabel: "Invested: $5,600",
    balanceLabel: "Value: $5,820",
  },
  {
    period: "Month 12",
    title: "Year in Review",
    description:
      "Spent 30 minutes total. Portfolio growing. Zero stress.",
    costLabel: "Invested: $10,400",
    balanceLabel: "Value: $10,850",
  },
];

function Card({
  card,
  variant,
  index,
}: {
  card: TimelineCard;
  variant: "forex" | "veqt";
  index: number;
}) {
  const isForex = variant === "forex";
  const dotColor = isForex ? "bg-[var(--color-negative)]" : "bg-[var(--color-positive)]";

  return (
    <div className="relative pl-6">
      {/* Timeline dot + line */}
      <div
        className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ${dotColor}`}
      />
      {index < 3 && (
        <div className="absolute left-[4.5px] top-4 w-px h-full bg-[var(--color-border)]" />
      )}

      <div className="pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          {card.period}
        </p>
        <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5">
          {card.title}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1 leading-relaxed">
          {card.description}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
          <span
            className="font-medium"
            style={{
              color: isForex
                ? "var(--color-negative)"
                : "var(--color-positive)",
            }}
          >
            {card.costLabel}
          </span>
          <span className="text-[var(--color-text-muted)]">
            {card.balanceLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export function JourneyTimeline() {
  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-5">
        Year 1: Two Paths Compared
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Forex column */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-negative)] mb-4">
            The Forex Path
          </p>
          {FOREX_STEPS.map((card, i) => (
            <Card key={i} card={card} variant="forex" index={i} />
          ))}
        </div>

        {/* VEQT column */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-positive)] mb-4">
            The VEQT Path
          </p>
          {VEQT_STEPS.map((card, i) => (
            <Card key={i} card={card} variant="veqt" index={i} />
          ))}
        </div>
      </div>

      {/* Summary boxes */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-3 text-center">
          <p className="text-lg font-bold tabular-nums text-[var(--color-negative)]">
            &minus;$2,200
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            Forex after Year 1
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Plus 500+ hours of stress
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-3 text-center">
          <p className="text-lg font-bold tabular-nums text-[var(--color-positive)]">
            +$450
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            VEQT after Year 1
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Plus 500 hours of your life back
          </p>
        </div>
      </div>
    </div>
  );
}
