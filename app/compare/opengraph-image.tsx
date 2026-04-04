import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Compare Canadian ETFs — BuyVEQT";
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
        {/* Top accent bar */}
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

        {/* BuyVEQT branding */}
        <div
          style={{
            position: "absolute",
            top: "30px",
            left: "60px",
            fontSize: "22px",
            fontWeight: 700,
            display: "flex",
          }}
        >
          <span style={{ color: "#111827" }}>Buy</span>
          <span style={{ color: "#c8102e" }}>VEQT</span>
        </div>

        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#111827",
            letterSpacing: "-1px",
            position: "relative",
          }}
        >
          Compare Canadian ETFs
        </div>

        <div
          style={{
            fontSize: "24px",
            color: "#6b7280",
            marginTop: "12px",
            position: "relative",
          }}
        >
          VEQT · XEQT · VGRO · ZEQT · VFV · VUN
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "36px",
            position: "relative",
          }}
        >
          {["Performance", "Fees", "Allocation", "Verdict"].map((label) => (
            <div
              key={label}
              style={{
                padding: "10px 20px",
                borderRadius: "24px",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                color: "#4b5563",
                fontSize: "16px",
                fontWeight: 500,
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              {label}
            </div>
          ))}
        </div>

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
