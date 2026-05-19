"use client";

import { useMemo } from "react";
import { useContainerWidth } from "@/lib/useContainerWidth";

interface HoldingsUniverseProps {
  compact?: boolean;
}

const COMPACT_THRESHOLD = 600;

/**
 * Renders ~13,800 cells (or ~2,300 on compact widths) as a single inline
 * SVG so the DOM stays light enough for sub-100ms first-paint inside the
 * editorial column.
 */
export function HoldingsUniverse({ compact }: HoldingsUniverseProps = {}) {
  const { ref, width } = useContainerWidth<HTMLDivElement>();
  const auto = width > 0 && width < COMPACT_THRESHOLD;
  const mobile = compact ?? auto;

  const rows = mobile ? 38 : 100;
  const cols = mobile ? 60 : 138;
  const total = rows * cols;
  const owned = Math.round(total * (9300 / 13700));

  const cellSize = 6;
  const cellGap = mobile ? 1 : 2;
  const stride = cellSize + cellGap;
  const svgW = cols * stride - cellGap;
  const svgH = rows * stride - cellGap;

  const cells = useMemo(() => {
    const arr: { x: number; y: number; o: boolean }[] = new Array(total);
    for (let i = 0; i < total; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      arr[i] = { x: c * stride, y: r * stride, o: i < owned };
    }
    return arr;
  }, [total, cols, stride, owned]);

  return (
    <div ref={ref} className="flagship-bleed" style={{ fontFamily: "var(--font-sans)" }}>
      <div style={{ marginBottom: mobile ? 14 : 22 }}>
        <p className="ed-label" style={{ margin: 0 }}>
          The Holdings Universe · one dot, one company
        </p>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontStyle: "italic",
            fontSize: mobile ? "clamp(20px, 5vw, 22px)" : "clamp(28px, 3.4vw, 34px)",
            lineHeight: 1.1,
            letterSpacing: "-0.018em",
            margin: "8px 0 0",
            color: "var(--ink)",
          }}
        >
          What you don&rsquo;t own when you own XEQT.
        </h3>
      </div>

      <div
        style={{
          background: "var(--paper-light)",
          border: "1px solid var(--ink)",
          padding: mobile ? "16px 16px 16px" : "30px 30px 26px",
        }}
      >
        <svg
          width="100%"
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Dot grid showing ${owned.toLocaleString()} cells (companies in both VEQT and XEQT) and ${(total - owned).toLocaleString()} cells (companies only in VEQT).`}
          style={{ display: "block", maxWidth: "100%", height: "auto" }}
        >
          {cells.map((c, i) => (
            <rect
              key={i}
              x={c.x}
              y={c.y}
              width={cellSize}
              height={cellSize}
              fill={c.o ? "var(--ink)" : "var(--stamp)"}
              fillOpacity={c.o ? 0.78 : 1}
            />
          ))}
        </svg>

        <div
          style={{
            marginTop: mobile ? 14 : 22,
            display: "grid",
            gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3, 1fr)",
            gap: mobile ? 12 : 22,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span
              style={{
                width: 12,
                height: 12,
                background: "var(--ink)",
                opacity: 0.78,
                marginTop: 5,
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 18,
                  lineHeight: 1.1,
                  color: "var(--ink)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                9,300
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 12.5,
                  color: "var(--ink-mute)",
                  marginTop: 2,
                }}
              >
                companies in both
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span
              style={{
                width: 12,
                height: 12,
                background: "var(--stamp)",
                marginTop: 5,
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 18,
                  lineHeight: 1.1,
                  color: "var(--stamp)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                4,400
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 12.5,
                  color: "var(--ink-mute)",
                  marginTop: 2,
                }}
              >
                only in VEQT
              </div>
            </div>
          </div>

          {!mobile && (
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontStyle: "italic",
                  fontSize: 18,
                  lineHeight: 1.1,
                  color: "var(--ink)",
                }}
              >
                +47%
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "var(--ink-mute)",
                  marginTop: 2,
                }}
              >
                broader book
              </div>
            </div>
          )}
        </div>
      </div>

      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: mobile ? 14 : 15,
          lineHeight: 1.55,
          color: "var(--ink-mute)",
          marginTop: mobile ? 10 : 16,
          marginBottom: 0,
          maxWidth: "64ch",
        }}
      >
        VEQT tracks broader FTSE and CRSP indices that include more small-cap
        and micro-cap names than the S&amp;P / MSCI indices XEQT uses. The
        extra{" "}
        <span style={{ color: "var(--stamp)", fontStyle: "normal", fontWeight: 600 }}>
          4,400 companies
        </span>{" "}
        are mostly small — but a wider net is the point of the product.
      </p>
    </div>
  );
}
