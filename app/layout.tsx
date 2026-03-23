import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuyVEQT — The VEQT Investor Community Hub",
  description:
    "BuyVEQT — The clearest unofficial resource for understanding VEQT. Compare all-in-one Canadian ETFs, explore holdings, and learn what you actually own.",
  openGraph: {
    title: "BuyVEQT — The VEQT Investor Community Hub",
    description:
      "Compare all-in-one Canadian ETFs, explore holdings, and learn what you actually own.",
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
      <body className="min-h-screen bg-[var(--color-base)] text-[var(--color-text-primary)]">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
