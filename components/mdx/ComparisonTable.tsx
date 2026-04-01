interface ComparisonTableProps {
  headers: string;
  rows: string;
  highlight?: string;
}

export function ComparisonTable({
  headers: headerStr,
  rows: rowsStr,
  highlight,
}: ComparisonTableProps) {
  const headers = headerStr.split("|").map((s) => s.trim());
  const rows = rowsStr
    .trim()
    .split(";;")
    .map((line) => line.trim().split("|").map((s) => s.trim()))
    .filter((row) => row.length > 1 || row[0] !== "");

  const highlightIndex = highlight
    ? headers.findIndex((h) => h === highlight)
    : -1;

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" style={{ display: "table" }}>
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className={`px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)] whitespace-nowrap ${
                    i === 0 ? "sticky left-0 z-10" : ""
                  }`}
                  style={{
                    backgroundColor:
                      i === highlightIndex
                        ? "rgba(200, 16, 46, 0.08)"
                        : "var(--color-card-hover)",
                    ...(i === 0 ? { backgroundColor: "var(--color-card-hover)" } : {}),
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-3 py-2.5 text-[var(--color-text-secondary)] border-t border-[var(--color-border)] whitespace-nowrap ${
                      cellIndex === 0
                        ? "sticky left-0 z-10 font-medium text-[var(--color-text-primary)]"
                        : ""
                    }`}
                    style={{
                      backgroundColor:
                        cellIndex === highlightIndex
                          ? "rgba(200, 16, 46, 0.04)"
                          : cellIndex === 0
                            ? rowIndex % 2 === 0
                              ? "var(--color-card)"
                              : "var(--color-card-hover)"
                            : rowIndex % 2 === 0
                              ? "transparent"
                              : "var(--color-card-hover)",
                      ...(cellIndex === 0 && cellIndex === highlightIndex
                        ? {
                            backgroundColor:
                              rowIndex % 2 === 0
                                ? "var(--color-card)"
                                : "var(--color-card-hover)",
                          }
                        : {}),
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
