interface DataUnavailableProps {
  type: "quote" | "chart" | "table";
  message?: string;
  className?: string;
}

function QuotePlaceholder({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
      <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
        Live Summary
      </p>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold text-[var(--color-text-muted)]">&mdash;</span>
        <span className="text-xs text-[var(--color-text-muted)]">CAD</span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-[var(--color-text-muted)]">&mdash; (&mdash;%)</span>
      </div>
      <div className="space-y-2 text-sm">
        {["MER", "AUM", "Dividend Yield", "52-Week Range"].map((label) => (
          <div key={label} className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">{label}</span>
            <span className="text-[var(--color-text-muted)]">&mdash;</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mt-3 pt-3 border-t border-[var(--color-border)] text-center">
        {message}
      </p>
    </div>
  );
}

function ChartPlaceholder({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-border)] bg-[var(--color-base)] ${
        className ?? "min-h-[320px]"
      }`}
    >
      <p className="text-sm text-[var(--color-text-muted)] text-center px-4">
        {message}
      </p>
    </div>
  );
}

function TablePlaceholder({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider w-40">
              Metric
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              &mdash;
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              &mdash;
            </th>
          </tr>
        </thead>
        <tbody>
          {["Price", "MER", "YTD Return"].map((label) => (
            <tr
              key={label}
              className="border-b last:border-b-0 border-[var(--color-border)]"
            >
              <td className="py-2.5 px-4 text-[var(--color-text-muted)]">{label}</td>
              <td className="py-2.5 px-4 text-[var(--color-text-muted)]">&mdash;</td>
              <td className="py-2.5 px-4 text-[var(--color-text-muted)]">&mdash;</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-[var(--color-text-muted)] px-4 py-2 border-t border-[var(--color-border)] text-center">
        {message}
      </p>
    </div>
  );
}

export default function DataUnavailable({
  type,
  message,
  className,
}: DataUnavailableProps) {
  const defaultMessages: Record<string, string> = {
    quote: "Market data temporarily unavailable",
    chart: "Chart data temporarily unavailable — check back shortly",
    table: "Comparison data temporarily unavailable",
  };

  const msg = message ?? defaultMessages[type];

  return (
    <div className={className}>
      {type === "quote" && <QuotePlaceholder message={msg} />}
      {type === "chart" && <ChartPlaceholder message={msg} className={className} />}
      {type === "table" && <TablePlaceholder message={msg} />}
    </div>
  );
}
