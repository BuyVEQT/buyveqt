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

        {/* VS display */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
          }}
        >
          <div
            style={{
              fontSize: "80px",
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            {fundA}
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 400,
              color: "#16a34a",
            }}
          >
            vs
          </div>
          <div
            style={{
              fontSize: "80px",
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            {fundB}
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "#9ca3af",
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          {comparison?.title || `${fundA} vs ${fundB} — Full Comparison`}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "18px",
            color: "#6b7280",
          }}
        >
          buyveqt.com
        </div>
      </div>
    ),
    { ...size }
  );
}
