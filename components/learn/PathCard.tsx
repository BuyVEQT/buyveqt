import Link from "next/link";
import type { LearnPath } from "@/lib/learn-paths-data";

interface PathCardProps {
  path: LearnPath;
  icon: string;
  accent?: boolean;
  big?: boolean;
}

/**
 * Round 4 v2 path card. Six in the grid:
 *  - icon tile (paper-warm on light, soft cream on dark)
 *  - "N parts" small-caps eyebrow
 *  - Fraunces title
 *  - Newsreader italic blurb
 *
 * `accent` (used only on the "My VEQT is down" path) flips the card to
 * the dark band styling so the most-urgent path reads prominently.
 */
export default function PathCard({ path, icon, accent = false, big = false }: PathCardProps) {
  const bg = accent ? "#0f0d0a" : "var(--paper-light)";
  const fg = accent ? "#f6efdc" : "var(--ink)";
  const subFg = accent ? "rgba(246,239,220,0.75)" : "var(--ink-soft)";
  const eyebrowFg = accent ? "rgba(246,239,220,0.55)" : "var(--ink-mute)";
  const iconBg = accent ? "rgba(246,239,220,0.10)" : "var(--paper-warm)";
  const iconFg = accent ? "#f6efdc" : "var(--stamp)";
  const border = accent ? "none" : "1px solid var(--rule-soft)";

  return (
    <Link
      href={`/learn/path/${path.id}`}
      style={{
        display: "block",
        padding: big ? "20px 22px 22px" : "16px 18px",
        background: bg,
        color: fg,
        border,
        borderRadius: 14,
        position: "relative",
        overflow: "hidden",
        textDecoration: "none",
        cursor: "pointer",
        transition: "transform 0.18s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: iconBg,
            color: iconFg,
            fontFamily: "var(--font-display)",
            fontSize: 18,
          }}
        >
          {icon}
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: eyebrowFg,
          }}
        >
          {path.slugs.length} parts
        </span>
      </div>
      <div
        className="ed-display"
        style={{
          fontSize: big ? 22 : 18,
          lineHeight: 1.15,
          letterSpacing: "-0.012em",
          color: fg,
        }}
      >
        {path.title}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 13,
          lineHeight: 1.5,
          marginTop: 6,
          color: subFg,
        }}
      >
        {path.description}
      </div>
    </Link>
  );
}
