import type { Metadata } from "next";
import Script from "next/script";
import { Newsreader, Inter, Fraunces, Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ThemeProvider, { NoFoucThemeScript } from "@/components/ThemeProvider";
import DesktopNav from "@/components/shell/DesktopNav";
import TopBar from "@/components/shell/TopBar";
import TabBar from "@/components/shell/TabBar";
import SiteFooter from "@/components/shell/SiteFooter";
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

// Archivo — the Instrument (home redesign + site shell) grotesk. No italic
// by design: the Instrument's emphasis grammar is weight + red, never slant.
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  weight: ["500", "600", "700", "800"],
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
// the same value for installed PWAs. Instrument ink, matching the masthead.
export const viewport: import("next").Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} ${fraunces.variable} ${archivo.variable}`} suppressHydrationWarning>
      <head>
        {/* No-FOUC theme init — MUST run before globals.css loads.
            Reads localStorage.veqt-theme, resolves "auto" via
            prefers-color-scheme, and writes data-theme on <html>
            synchronously so dark-mode users don't see a cream flash
            on cold loads. */}
        <NoFoucThemeScript />
      </head>
      <body className="min-h-dvh bg-[var(--color-base)] text-[var(--color-text-primary)]">
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
          {/*
            The Instrument footer's ink band renders on mobile and carries
            its own TabBar clearance (margin-bottom + safe-area inset), so
            the old 90px content pad here would just read as dead white
            space between the page and the band.
          */}
          <div>{children}</div>
          <SiteFooter />
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
