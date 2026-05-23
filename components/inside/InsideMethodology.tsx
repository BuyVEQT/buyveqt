import Link from "next/link";
import Card from "@/components/ui/Card";
import SectionHead from "@/components/ui/SectionHead";

/**
 * Dark "How we know · The methodology." band. One per page per the dark-band
 * motif. Two-link footer: vermilion-underlined "Read methodology →" and a
 * muted "Sources" link.
 */
export default function InsideMethodology() {
  return (
    <Card dark>
      <SectionHead
        kicker="How we know"
        title="The methodology."
        size="md"
        dark
      />
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 15,
          lineHeight: 1.6,
          color: "rgba(246, 239, 220, 0.8)",
          margin: "14px 0 20px",
          maxWidth: "54ch",
        }}
      >
        Holdings are pulled from Vanguard Canada&rsquo;s daily NAV file, then
        attributed back to sleeves by region. Sector tags follow the GICS
        classification.
      </p>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <Link
          href="/methodology"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--paper)",
            borderBottom: "1px solid var(--stamp)",
            paddingBottom: 4,
            textDecoration: "none",
          }}
        >
          Read methodology →
        </Link>
        <Link
          href="/methodology#sources"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(246, 239, 220, 0.6)",
            borderBottom: "1px solid rgba(246, 239, 220, 0.3)",
            paddingBottom: 4,
            textDecoration: "none",
          }}
        >
          Sources
        </Link>
      </div>
    </Card>
  );
}
