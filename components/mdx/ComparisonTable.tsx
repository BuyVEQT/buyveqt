const css = `
.mcmp {
  margin: 26px 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  font-family: var(--ins-font);
}
.mcmp__table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}
.mcmp__th {
  padding: 10px 14px 9px;
  text-align: left;
  white-space: nowrap;
  /* TRUE LABEL — column heads. Caps stay; size goes to the floor and
     tracking comes back a notch (0.18em → 0.14em) because a nowrap head
     sets its column's minimum width for every body cell under it, so
     growth here widens the whole table. .mcmp__td is untouched: those
     cells are the table's values. */
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  border-bottom: 1px solid var(--ins-ink);
  background: var(--ins-paper);
}
/* The highlighted column wears the red — a 3px rule over its head and the
   only bold cells in the body. */
.mcmp__th--hl {
  color: var(--ins-signal);
  border-top: 3px solid var(--ins-signal);
}
.mcmp__td {
  padding: 11px 14px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.45;
  color: var(--ins-gray-700);
  border-bottom: 1px solid var(--ins-hair);
  background: var(--ins-paper);
}
.mcmp__td--hl {
  font-weight: 700;
  color: var(--ins-ink);
}
/* First column stays put while the rest scrolls under it. */
.mcmp__th--stick,
.mcmp__td--stick {
  position: sticky;
  left: 0;
  z-index: 1;
  font-weight: 700;
  color: var(--ins-ink);
}
@media (max-width: 640px) {
  .mcmp {
    margin: 18px 0;
  }
  .mcmp__th {
    padding: 9px 11px 8px;
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  .mcmp__td {
    padding: 9px 11px;
    font-size: 13px;
  }
}
`;

interface ComparisonTableProps {
  headers: string;
  rows: string;
  highlight?: string;
}

/**
 * Pipe-and-semicolon table used across the comparison dispatches. Turn 7
 * restyles it to the Instrument's ruled grammar — square corners, ink
 * hairlines, Archivo labels, red reserved for the highlighted column — and
 * leaves the `headers` / `rows` / `highlight` contract untouched, so no MDX
 * call site changes.
 *
 * Server component: nothing here needed client JS.
 */
export function ComparisonTable({
  headers: headerStr,
  rows: rowsStr,
  highlight,
}: ComparisonTableProps) {
  const headers = headerStr.split("|").map((s) => s.trim());
  const rows = rowsStr
    .trim()
    .split(";;")
    .map((line) =>
      line
        .trim()
        .split("|")
        .map((s) => s.trim())
    )
    .filter((row) => row.length > 1 || row[0] !== "");

  const highlightIndex = highlight
    ? headers.findIndex((h) => h === highlight)
    : -1;

  return (
    <div className="mcmp">
      <table className="mcmp__table">
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th
                key={header + i}
                scope="col"
                className={[
                  "mcmp__th",
                  i === highlightIndex ? "mcmp__th--hl" : "",
                  i === 0 ? "mcmp__th--stick" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row[0] + rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cell + cellIndex}
                  className={[
                    "mcmp__td",
                    cellIndex === highlightIndex ? "mcmp__td--hl" : "",
                    cellIndex === 0 ? "mcmp__td--stick" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  );
}
