import { LEARN_PATHS } from "@/lib/learn-paths-data";
import SectionHead from "@/components/ui/SectionHead";
import PathCard from "./PathCard";

/**
 * Per the design ref: small icon glyphs per path, "down" gets the
 * accent (dark card) so the most urgent path reads prominently.
 */
const PATH_ICON: Record<string, string> = {
  new: "◐",
  comparing: "⇋",
  accounts: "☂",
  down: "↓",
  withdrawal: "Ω",
  essays: "✒",
};

const ACCENT_PATHS = new Set(["down"]);

/**
 * 6-card path grid, shown only in the default (no-filter) state on
 * /learn. 2-col on tablet, 3-col on desktop.
 */
export default function PathsGrid() {
  return (
    <section style={{ paddingTop: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <SectionHead
          kicker="Find your path"
          title="Six ways in."
          size="lg"
        />
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 14,
            color: "var(--ink-mute)",
          }}
        >
          Choose the one that fits where you are.
        </span>
      </div>
      <div className="learn-paths-grid">
        {LEARN_PATHS.map((p) => (
          <PathCard
            key={p.id}
            path={p}
            icon={PATH_ICON[p.id] ?? "•"}
            accent={ACCENT_PATHS.has(p.id)}
            big
          />
        ))}
      </div>
    </section>
  );
}
