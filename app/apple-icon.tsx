import { ImageResponse } from "next/og";

// Apple touch icon — 180×180 PNG used when an iOS user bookmarks the site
// to their home screen. Matches the existing /icon.svg brand: a vermilion
// "V" on a cream paper field, with rounded corners.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // iOS rounds the corners itself for apple-touch-icon-precomposed.
          // We fill the square so the OS-applied corner radius reveals a
          // cream paper bezel, matching the brand.
          background: "#f6efdc",
          color: "#c8102e",
          fontFamily: "Georgia, serif",
          fontWeight: 700,
          fontSize: 130,
          // Slight optical lift so the "V" sits visually centered.
          letterSpacing: "-0.04em",
        }}
      >
        <span
          style={{
            // The serif "V" has a heavier left stroke; nudge right by 2px so
            // the letter feels centered on the cream field.
            transform: "translateX(2px)",
          }}
        >
          V
        </span>
      </div>
    ),
    { ...size }
  );
}
