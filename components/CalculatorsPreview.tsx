import Link from "next/link";

const CALCULATORS = [
  {
    title: "If You Invested",
    description:
      "See what a past VEQT investment would be worth today using real historical prices.",
    tab: "",
  },
  {
    title: "DCA Planner",
    description:
      "See how regular monthly investments could grow over time with compound returns.",
    tab: "?tab=dca",
  },
  {
    title: "Dividend Estimator",
    description:
      "Estimate the annual, quarterly, and monthly income from your VEQT portfolio.",
    tab: "?tab=dividends",
  },
  {
    title: "TFSA / RRSP Projector",
    description:
      "Project how VEQT could grow inside your registered account over time.",
    tab: "?tab=tfsa-rrsp",
  },
];

export default function CalculatorsPreview() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          Calculators
        </h2>
        <Link
          href="/invest"
          className="text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
        >
          View all &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {CALCULATORS.map((calc) => (
          <Link
            key={calc.title}
            href={`/invest${calc.tab}`}
            className="group rounded-lg border border-[var(--color-border)] bg-white p-5 hover:border-[var(--color-border-light)] transition-colors"
          >
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors">
              {calc.title}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed">
              {calc.description}
            </p>
            <span className="inline-block mt-3 text-sm font-medium text-[var(--color-brand)]">
              Try it &rarr;
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
