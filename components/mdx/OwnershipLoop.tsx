"use client";

import { useEffect, useState } from "react";

interface OwnershipLoopProps {
  compact?: boolean;
}

export function OwnershipLoop({ compact }: OwnershipLoopProps = {}) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const mobile = compact ?? isMobile;

  return (
    <div
      className="my-10"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <div style={{ marginBottom: 22 }}>
        <p className="ed-label" style={{ margin: 0 }}>
          The Ownership Loop · who answers to whom
        </p>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontStyle: "italic",
            fontSize: mobile ? 24 : 32,
            lineHeight: 1.05,
            letterSpacing: "-0.018em",
            margin: "8px 0 0",
            color: "var(--ink)",
          }}
        >
          Follow your $200 management fee.
        </h3>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
          gap: 0,
          border: "1px solid var(--ink)",
          background: "var(--paper-light)",
        }}
      >
        {/* Vanguard panel */}
        <div
          style={{
            padding: mobile ? "26px 22px 28px" : "30px 32px 32px",
            borderRight: mobile ? "none" : "1px solid var(--ink)",
            borderBottom: mobile ? "1px solid var(--ink)" : "none",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: "var(--stamp)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: 26,
                letterSpacing: "-0.01em",
                color: "var(--ink)",
              }}
            >
              Vanguard
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--stamp)",
                border: "1px solid var(--stamp)",
                padding: "2px 6px",
                borderRadius: 2,
              }}
            >
              Mutual
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 13.5,
              color: "var(--ink-mute)",
              margin: "0 0 22px",
            }}
          >
            No ticker. No outside shareholders.
          </p>

          <div
            style={{
              position: "relative",
              height: mobile ? 240 : 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 360 280"
              role="img"
              aria-label="Vanguard ownership loop: investor pays fee to fund, fund pays manager, manager returns ownership to investors."
              style={{ position: "absolute", inset: 0 }}
            >
              <defs>
                <marker
                  id="vg-arrow-ink"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M0,0 L10,5 L0,10 z" fill="var(--ink)" />
                </marker>
                <marker
                  id="vg-arrow-stamp"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M0,0 L10,5 L0,10 z" fill="var(--stamp)" />
                </marker>
              </defs>

              <ellipse
                cx="180"
                cy="140"
                rx="140"
                ry="100"
                fill="none"
                stroke="var(--stamp)"
                strokeWidth="2.5"
                strokeDasharray="6 5"
                opacity="0.5"
              />

              <path d="M 180,40 L 195,40" stroke="var(--stamp)" strokeWidth="2.5" fill="none" markerEnd="url(#vg-arrow-stamp)" />
              <path d="M 320,140 L 320,155" stroke="var(--stamp)" strokeWidth="2.5" fill="none" markerEnd="url(#vg-arrow-stamp)" />
              <path d="M 180,240 L 165,240" stroke="var(--stamp)" strokeWidth="2.5" fill="none" markerEnd="url(#vg-arrow-stamp)" />
              <path d="M 40,140 L 40,125" stroke="var(--stamp)" strokeWidth="2.5" fill="none" markerEnd="url(#vg-arrow-stamp)" />

              <g>
                <rect x="135" y="22" width="90" height="40" fill="var(--ink)" stroke="var(--ink)" strokeWidth="1.5" />
                <text x="180" y="40" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="9.5" fontWeight="700" letterSpacing="0.18em" fill="var(--paper)">YOU</text>
                <text x="180" y="53" textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="11" fill="var(--paper)" opacity="0.75">the investor</text>
              </g>

              <g>
                <rect x="135" y="120" width="90" height="40" fill="var(--paper-light)" stroke="var(--ink)" strokeWidth="1.5" />
                <text x="180" y="138" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="9.5" fontWeight="700" letterSpacing="0.18em" fill="var(--ink)">VEQT</text>
                <text x="180" y="151" textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="11" fill="var(--ink-mute)">the fund</text>
              </g>

              <g>
                <rect x="115" y="218" width="130" height="40" fill="var(--paper-light)" stroke="var(--ink)" strokeWidth="1.5" />
                <text x="180" y="236" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="9.5" fontWeight="700" letterSpacing="0.18em" fill="var(--ink)">VANGUARD</text>
                <text x="180" y="249" textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="11" fill="var(--ink-mute)">the manager</text>
              </g>

              <path d="M 180,68 L 180,114" stroke="var(--ink)" strokeWidth="2" fill="none" markerEnd="url(#vg-arrow-ink)" />
              <path d="M 180,166 L 180,212" stroke="var(--ink)" strokeWidth="2" fill="none" markerEnd="url(#vg-arrow-ink)" />

              <path
                d="M 115,238 C 50,238 30,140 50,90 C 70,55 105,50 135,50"
                stroke="var(--stamp)"
                strokeWidth="2.5"
                fill="none"
                markerEnd="url(#vg-arrow-stamp)"
                strokeLinecap="round"
              />

              <text x="200" y="92" fontFamily="var(--font-sans)" fontSize="9.5" fontWeight="700" letterSpacing="0.16em" fill="var(--ink-mute)">$200/yr</text>
              <text x="200" y="190" fontFamily="var(--font-sans)" fontSize="9.5" fontWeight="700" letterSpacing="0.16em" fill="var(--ink-mute)">MER</text>
              <text fontFamily="var(--font-serif)" fontStyle="italic" fontSize="11" fill="var(--stamp)">
                <tspan x="58" y="158">closes</tspan>
                <tspan x="58" dy="14">the loop</tspan>
              </text>
            </svg>
          </div>

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--ink-soft)",
              marginTop: 12,
              marginBottom: 0,
            }}
          >
            Vanguard is owned by its US funds. Those funds are owned by their
            investors. The fee pays the manager — and the manager is, in
            effect,{" "}
            <em style={{ color: "var(--stamp)", fontStyle: "italic", fontWeight: 600 }}>
              you
            </em>
            .
          </p>
        </div>

        {/* BlackRock panel */}
        <div
          style={{
            padding: mobile ? "26px 22px 28px" : "30px 32px 32px",
            position: "relative",
            background: "color-mix(in oklab, var(--ink) 3%, transparent)",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: 26,
                letterSpacing: "-0.01em",
                color: "var(--ink)",
              }}
            >
              BlackRock
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--ink-mute)",
                border: "1px solid var(--ink-mute)",
                padding: "2px 6px",
                borderRadius: 2,
              }}
            >
              NYSE: BLK
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 13.5,
              color: "var(--ink-mute)",
              margin: "0 0 22px",
            }}
          >
            Publicly traded. $12T under management. Two masters.
          </p>

          <div style={{ position: "relative", height: mobile ? 240 : 280 }}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 360 280"
              role="img"
              aria-label="BlackRock outflow: investor pays fee to fund, fund pays manager, profits flow up and out to outside shareholders."
              style={{ position: "absolute", inset: 0 }}
            >
              <defs>
                <marker id="br-arrow-ink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill="var(--ink)" />
                </marker>
                <marker id="br-arrow-mute" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-mute)" />
                </marker>
              </defs>

              <g>
                <rect x="135" y="218" width="90" height="40" fill="var(--ink)" stroke="var(--ink)" strokeWidth="1.5" />
                <text x="180" y="236" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="9.5" fontWeight="700" letterSpacing="0.18em" fill="var(--paper)">YOU</text>
                <text x="180" y="249" textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="11" fill="var(--paper)" opacity="0.75">the investor</text>
              </g>

              <g>
                <rect x="135" y="150" width="90" height="40" fill="var(--paper-light)" stroke="var(--ink)" strokeWidth="1.5" />
                <text x="180" y="168" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="9.5" fontWeight="700" letterSpacing="0.18em" fill="var(--ink)">XEQT</text>
                <text x="180" y="181" textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="11" fill="var(--ink-mute)">the fund</text>
              </g>

              <g>
                <rect x="115" y="82" width="130" height="40" fill="var(--paper-light)" stroke="var(--ink)" strokeWidth="1.5" />
                <text x="180" y="100" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="9.5" fontWeight="700" letterSpacing="0.18em" fill="var(--ink)">BLACKROCK</text>
                <text x="180" y="113" textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="11" fill="var(--ink-mute)">the manager</text>
              </g>

              <g>
                <rect x="40" y="10" width="280" height="46" fill="none" stroke="var(--ink-mute)" strokeWidth="1" strokeDasharray="4 3" />
                <text x="180" y="26" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="9" fontWeight="700" letterSpacing="0.22em" fill="var(--ink-mute)">
                  OUTSIDE SHAREHOLDERS · NYSE: BLK
                </text>
                {[60, 100, 140, 180, 220, 260, 300].map((x, i) => {
                  const h = [14, 22, 18, 26, 16, 24, 20][i];
                  return (
                    <rect
                      key={x}
                      x={x - 8}
                      y={52 - h}
                      width="14"
                      height={h}
                      fill="var(--ink-mute)"
                      opacity="0.5"
                    />
                  );
                })}
              </g>

              <path d="M 180,212 L 180,196" stroke="var(--ink)" strokeWidth="2" fill="none" markerEnd="url(#br-arrow-ink)" />
              <path d="M 180,144 L 180,128" stroke="var(--ink)" strokeWidth="2" fill="none" markerEnd="url(#br-arrow-ink)" />

              <path d="M 140,82 L 110,60" stroke="var(--ink-mute)" strokeWidth="2" fill="none" markerEnd="url(#br-arrow-mute)" />
              <path d="M 180,82 L 180,60" stroke="var(--ink-mute)" strokeWidth="2" fill="none" markerEnd="url(#br-arrow-mute)" />
              <path d="M 220,82 L 250,60" stroke="var(--ink-mute)" strokeWidth="2" fill="none" markerEnd="url(#br-arrow-mute)" />

              <text x="200" y="208" fontFamily="var(--font-sans)" fontSize="9.5" fontWeight="700" letterSpacing="0.16em" fill="var(--ink-mute)">$200/yr</text>
              <text x="200" y="140" fontFamily="var(--font-sans)" fontSize="9.5" fontWeight="700" letterSpacing="0.16em" fill="var(--ink-mute)">MER</text>
              <text x="68" y="74" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="11" fill="var(--ink-mute)">profits flow out</text>
            </svg>
          </div>

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--ink-soft)",
              marginTop: 12,
              marginBottom: 0,
            }}
          >
            BlackRock is a public company. Pension funds, hedge funds, and
            retail traders own BLK stock and expect it to grow. Your fee pays
            the manager — and the manager, in turn, must answer to{" "}
            <em style={{ fontStyle: "italic" }}>them</em>.
          </p>
        </div>
      </div>

      {/* Takeaway band — discipline color, hardcoded like Card dark */}
      <div
        style={{
          marginTop: -1,
          padding: mobile ? "22px 22px" : "26px 32px",
          background: "#0f0d0a",
          color: "#f6efdc",
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "1fr 2fr",
          gap: 18,
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(246,239,220,0.55)",
              margin: 0,
            }}
          >
            The structural difference
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontStyle: "italic",
              fontSize: mobile ? 19 : 22,
              lineHeight: 1.15,
              marginTop: 6,
              marginBottom: 0,
              letterSpacing: "-0.015em",
              color: "#f6efdc",
            }}
          >
            One company has
            <br />
            one master.
          </p>
        </div>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 14.5,
            lineHeight: 1.6,
            color: "rgba(246,239,220,0.85)",
            margin: 0,
          }}
        >
          When Vanguard cuts a fee, its owners get the savings — because its
          owners are the investors. When BlackRock cuts a fee, BLK shares
          take the hit. That&rsquo;s not a moral failing on BlackRock&rsquo;s
          part. It&rsquo;s just a different architecture. And over thirty
          years, the architecture is what compounds.
        </p>
      </div>
    </div>
  );
}
