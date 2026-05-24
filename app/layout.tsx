import type { Metadata } from "next";
import Script from "next/script";
import { Newsreader, Inter, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import DesktopNav from "@/components/shell/DesktopNav";
import TopBar from "@/components/shell/TopBar";
import TabBar from "@/components/shell/TabBar";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
} from "@/lib/seo-config";

// Font weights below are tuned to what the codebase actually renders.
// Total payload was 27 font files (2×4 + 5 + 2×6); now 13. Each `weight × style`
// combination is a separate file fetch on first paint.
//
// Newsreader (body serif): paragraph text + italic emphasis only.
//   Used: 400, 400 italic, 500, 500 italic. Bolder body text uses Inter.
// Inter (sans / labels / UI): never below 500 — labels are uppercase
//   bold, buttons are 600, numerals are 600/700.
// Fraunces (display): headlines + display numerals + the broadsheet
//   italic. Bold weight is 700; 800/900 is OG-image only (no next/font
//   needed). 600 was specified but never rendered (no font-weight:600
//   on --font-display selectors).
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  // Keep --font-outfit for back-compat (some legacy components reference it)
  // and add --font-inter as the new workhorse for the editorial system.
  variable: "--font-inter",
  weight: ["500", "600", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BuyVEQT — The VEQT Investor Community Hub",
    template: "%s | BuyVEQT",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "VEQT",
    "VEQT.TO",
    "Vanguard All-Equity ETF",
    "Canadian ETF",
    "passive investing",
    "index investing",
    "TFSA",
    "RRSP",
    "Canadian investing",
    "all-in-one ETF",
    "XEQT",
    "VGRO",
    "ETF comparison",
    "buy VEQT",
    "Canadian passive investor",
  ],
  authors: [{ name: "BuyVEQT Community" }],
  creator: "BuyVEQT",
  publisher: "BuyVEQT",

  openGraph: {
    type: "website",
    locale: "en_CA",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "BuyVEQT — The VEQT Investor Community Hub",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "BuyVEQT — The VEQT Investor Community Hub",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "BuyVEQT — The VEQT Investor Community Hub",
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
  },
};

// Pairs with app/manifest.ts. The theme-color meta is what sets the URL bar
// tint on Android Chrome and the Add-to-Home-Screen splash; manifest carries
// the same value for installed PWAs.
export const viewport: import("next").Viewport = {
  themeColor: "#c8102e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" className={`${newsreader.variable} ${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        {/* Dark mode disabled for the Round 4 polish pass. Light is the only
            supported theme until we audit dark-mode contrast across all D2
            pages. ThemeProvider stays mounted (no-op) so the architecture
            remains in place for a later re-enable. */}
      </head>
      <body className="min-h-screen bg-[var(--color-base)] text-[var(--color-text-primary)]">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
            },
          }}
        />
        {/*
          Per-page structured data lives on the relevant pages — not in the
          root layout. FAQPage + InvestmentFund render on / and /inside-veqt
          where they describe the actual page content. See lib/seo-config.ts.
        */}
        <ThemeProvider>
          <DesktopNav />
          <TopBar />
          <div style={{ paddingBottom: "var(--shell-bottom-pad, 0)" }} className="[--shell-bottom-pad:90px] lg:[--shell-bottom-pad:0]">
            {children}
          </div>
          <TabBar />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <Script
          data-goatcounter="https://buyveqt.goatcounter.com/count"
          src="//gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
