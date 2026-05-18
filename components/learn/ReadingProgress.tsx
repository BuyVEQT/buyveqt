/**
 * Round 4 v2 — re-exports the broadsheet ReadingProgress so the new
 * /learn/[slug] page can import from components/learn/* alongside the
 * other reader chrome. The component itself is design-system
 * neutral (vermilion bar on transparent), so no restyle is needed.
 */
export { default } from "@/components/broadsheet/dispatch/ReadingProgress";
