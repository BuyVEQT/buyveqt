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
          backgroundColor: "#111827",
          padding: "60px",
          position: "relative",
        }}
      >
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

        {/* BuyVEQT small branding */}
        <div
          style={{
            position: "absolute",
            top: "30px",
            left: "60px",
            fontSize: "20px",
            fontWeight: 700,
            color: "#6b7280",
            display: "flex",
          }}
        >
          <span>Buy</span>
          <span style={{ color: "#16a34a" }}>VEQT</span>
        </div>

        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-1px",
          }}
        >
          Compare Canadian ETFs
        </div>

        <div
          style={{
            fontSize: "24px",
            color: "#9ca3af",
            marginTop: "16px",
          }}
        >
          VEQT vs XEQT &middot; VGRO &middot; ZEQT &middot; VFV &middot; VUN
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          {["Performance", "Fees", "Allocation", "Verdict"].map((label) => (
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
          ))}
        </div>

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
