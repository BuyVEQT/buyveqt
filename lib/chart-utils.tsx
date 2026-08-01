/**
 * Shared chart helpers.
 *
 * Trimmed to one function when recharts was retired: GRID_PROPS, TICK_STYLE,
 * AXIS_PROPS and ChartTooltipWrapper were all recharts-shaped props with no
 * remaining callers. The surviving charts are hand-rolled SVG and style
 * themselves from the --ins-* tokens.
 */

/** Format a number as Canadian dollars. Shows decimals for values under $100. */
export function formatDollars(value: number): string {
  if (value < 100) return "$" + value.toFixed(2);
  return "$" + Math.round(value).toLocaleString("en-CA");
}
