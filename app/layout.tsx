import type { Metadata } from "next";
import { ThemeProvider } from "@/lib/ThemeContext";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('buyveqt-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--color-base)] text-[var(--color-text-primary)]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
