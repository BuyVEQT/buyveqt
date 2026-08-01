import type { Metadata } from "next";
import Script from "next/script";
import { Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
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

// ONE FAMILY, SITE-WIDE. Archivo is the Instrument's face and now the only
// font the site loads: it renders the shell (nav, top bar, tab bar, footer),
// every route, every article exhibit and every calculator chart. The legacy
// broadsheet trio — Newsreader (body serif), Inter (sans/labels/UI) and
// Fraunces (display) — was retired once the last routes and MDX widgets
// moved to the Instrument; nothing references their family aliases any
// more, so all three next/font configs are gone along with the ~247 KB of
// font bytes they cost.
//
// Payload: 27 font files originally → 13 after the weight trim → 4 now.
// Archivo preloads (no `preload: false`) because it is on the critical path
// of literally every page.
//
// No italic by design: the Instrument's emphasis grammar is weight + red,
// never slant. Do not add a `style: ["italic"]` axis — components that want
// emphasis step up a weight instead.
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
// the same value for installed PWAs. Instrument signal red — the one colour
// the system uses to announce itself.
export const viewport: import("next").Viewport = {
  themeColor: "#e8442e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={archivo.variable}>
      <head>
        {/*
          GoatCounter's count.js loads `afterInteractive`, so its DNS lookup +
          TLS handshake would otherwise start well after first paint. The
          preconnect warms the connection during head parse; the script then
          only pays for the transfer.
        */}
        <link rel="preconnect" href="https://gc.zgo.at" />
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
