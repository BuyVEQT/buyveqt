import Link from "next/link";

const CALCULATORS = [
  {
    title: "DCA Calculator",
    description:
      "See how regular monthly investments could grow over time with compound returns.",
  },
  {
    title: "Dividend Estimator",
    description:
      "Estimate the annual, quarterly, and monthly income from your VEQT portfolio.",
  },
  {
    title: "TFSA / RRSP Projector",
    description:
      "Project how VEQT could grow inside your registered account over time.",
  },
];

export default function CalculatorsPreview() {
  return (
    <section className="py-10">
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
        Plan Your Investment
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Use our calculators to visualize your VEQT investment.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CALCULATORS.map((calc) => (
          <Link
            key={calc.title}
            href="/calculators"
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
