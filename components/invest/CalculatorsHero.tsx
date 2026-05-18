import SectionLabel from "@/components/ui/SectionLabel";
import Lede from "@/components/ui/Lede";

/**
 * /calculators hero. Section label + italic display h1 + drop-cap lede.
 * Mirrors the editorial rhythm of /, /learn, /compare, /inside-veqt.
 */
export default function CalculatorsHero() {
  return (
    <header
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 20,
        padding: "8px 0 4px",
      }}
      className="calc-hero"
    >
      <div>
        <SectionLabel>Five calculators on one fund</SectionLabel>
        <h1
          className="ed-display-italic"
          style={{
            fontSize: "clamp(2.25rem, 6vw, 4.25rem)",
            lineHeight: 1,
            margin: "12px 0 0",
            color: "var(--ink)",
          }}
        >
          The Math.
        </h1>
      </div>
      <Lede style={{ fontSize: "1.125rem", maxWidth: "46ch" }}>
        Five questions about VEQT, answered in arithmetic. What it would
        have been; what it could become; what the dividends actually add;
        where it should sit; and when the math says you can stop.
      </Lede>
    </header>
  );
}
