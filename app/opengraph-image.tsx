import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BuyVEQT — The VEQT Investor Community Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111827",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: "#16a34a",
          }}
        />

        {/* Brand name */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-2px",
            display: "flex",
          }}
        >
          <span>Buy</span>
          <span style={{ color: "#16a34a" }}>VEQT</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 400,
            color: "#9ca3af",
            marginTop: "16px",
          }}
        >
          The VEQT Investor Community Hub
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          {["Live Data", "Fund Comparisons", "Education"].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: "8px 20px",
                  borderRadius: "20px",
                  border: "1px solid #374151",
                  color: "#d1d5db",
                  fontSize: "16px",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "18px",
            color: "#6b7280",
          }}
        >
          buyveqt.ca
        </div>
      </div>
    ),
    { ...size }
  );
}
