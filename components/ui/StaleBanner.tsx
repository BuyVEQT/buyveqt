interface StaleBannerProps {
  fetchedAt: string; // ISO timestamp of the cached data
  className?: string;
}

function formatAbsoluteET(isoString: string): string {
  return new Date(isoString).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }) + " ET";
}

export default function StaleBanner({ fetchedAt, className }: StaleBannerProps) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 ${className ?? ""}`}
    >
      {/* Info circle icon */}
      <svg
        className="w-4 h-4 text-amber-500 shrink-0 mt-px"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-xs text-amber-700 leading-relaxed">
        Market data may be delayed — showing last available data from{" "}
        {formatAbsoluteET(fetchedAt)}
      </p>
    </div>
  );
}
