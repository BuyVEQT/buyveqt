import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuyVEQT — The VEQT Investor Community Hub",
  description:
    "The unofficial community hub for VEQT (Vanguard All-Equity ETF) investors. Live price data, performance charts, asset allocation breakdown, and educational resources for Canadian ETF investors.",
  openGraph: {
    title: "BuyVEQT — The VEQT Investor Community Hub",
    description:
      "Live VEQT price data, performance charts, and resources for Canadian ETF investors.",
    type: "website",
    url: "https://buyveqt.com",
    siteName: "BuyVEQT",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
