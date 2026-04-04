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
          backgroundColor: "#f9fafb",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Top accent bar — brand red */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #c8102e 0%, #e11d48 100%)",
          }}
        />

        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.5,
          }}
        />

        {/* Brand name */}
        <div
          style={{
            fontSize: "80px",
            fontWeight: 800,
            letterSpacing: "-3px",
            display: "flex",
            position: "relative",
          }}
        >
          <span style={{ color: "#111827" }}>Buy</span>
          <span style={{ color: "#c8102e" }}>VEQT</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 400,
            color: "#4b5563",
            marginTop: "12px",
            position: "relative",
          }}
        >
          One ETF. The whole world.
        </div>

        {/* Stat pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "36px",
            position: "relative",
          }}
        >
          {[
            { value: "13,700+", label: "stocks" },
            { value: "50+", label: "countries" },
            { value: "~0.20%", label: "MER" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 20px",
                borderRadius: "24px",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#16a34a",
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "#6b7280",
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            fontSize: "18px",
            fontWeight: 500,
            color: "#9ca3af",
          }}
        >
          buyveqt.ca
        </div>
      </div>
    ),
    { ...size }
  );
}
