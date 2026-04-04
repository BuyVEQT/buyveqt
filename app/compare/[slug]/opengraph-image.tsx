import { ImageResponse } from "next/og";
import { COMPARISON_PAGES } from "@/data/comparisons";

export const alt = "Fund Comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comparison = COMPARISON_PAGES[slug];

  const funds = slug.split("-vs-").map((f) => f.toUpperCase());
  const fundA = funds[0] || "VEQT";
  const fundB = funds[1] || "???";

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

        {/* VS display */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "84px",
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-2px",
            }}
          >
            {fundA}
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 500,
              color: "#c8102e",
            }}
          >
            vs
          </div>
          <div
            style={{
              fontSize: "84px",
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-2px",
            }}
          >
            {fundB}
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "#6b7280",
            marginTop: "20px",
            textAlign: "center",
            position: "relative",
          }}
        >
          {comparison?.title || `${fundA} vs ${fundB} — Full Comparison`}
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
