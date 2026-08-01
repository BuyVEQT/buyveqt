import type { Metadata } from "next";
import Script from "next/script";
import { Archivo, Newsreader } from "next/font/google";
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

// ONE FAMILY FOR THE INSTRUMENT. Archivo is the Instrument's face and the
// site's default: it renders the shell (nav, top bar, tab bar, footer),
// every route, every article exhibit and every calculator chart. The legacy
// broadsheet trio — Newsreader (body serif), Inter (sans/labels/UI) and
// Fraunces (display) — was retired once the last routes and MDX widgets
// moved to the Instrument, and Inter and Fraunces are gone for good: nothing
// references their family aliases and the ~180 KB they cost is not coming
// back.
//
// Payload: 27 font files originally → 13 after the weight trim → 4 for
// Archivo, plus the 2 Newsreader faces below.
//
// No italic in Archivo by design: the Instrument's emphasis grammar is
// weight + red, never slant. Do not add a `style: ["italic"]` axis to it —
// components that want emphasis step up a weight instead. (Newsreader is
// the exception, and only inside prose; see below.)
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  weight: ["500", "600", "700", "800"],
});

// TURN 8 — SERIF, FOR ARTICLE PROSE AND NOTHING ELSE.
//
// The one face that came back. The Turn-8 build contract sets running
// article body copy in a serif at 18–19px/1.65 because a 68ch column of
// grotesque is a poster, not a read; Archivo keeps every other job on the
// page (headings, kickers, tables, code, captions, exhibits, all chrome).
// Exposed as --ins-serif in globals.css, and the ONLY selectors allowed to
// reach for it are the prose paragraph/list/blockquote rules in
// app/learn/[slug]/page.tsx and components/weekly/WeeklyDispatchLayout.tsx.
//
// Italic ships here (unlike Archivo) because prose has real italics —
// book titles, ticker asides, emphasis inside a sentence — and a synthesised
// oblique on a serif is visibly wrong.
//
// `preload: false` on purpose: the shell and every non-article route render
// entirely in Archivo, so preloading this would put ~40 KB on the critical
// path of pages that never paint a serif glyph. Articles pay for it on
// demand, and `display: "swap"` means the first paint is Georgia rather
// than nothing.
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  // 600 rides along so <strong> inside prose gets a real bold cut —
  // browsers otherwise synthesise one, which reads smeared at 18.5px.
  // Variable font: the extra weight is the same file, zero added bytes.
  weight: ["400", "600"],
  style: ["normal", "italic"],
  preload: false,
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
    <html lang="en" className={`${archivo.variable} ${newsreader.variable}`}>
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
