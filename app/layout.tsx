import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
} from "@/lib/seo-config";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('buyveqt:theme');if(!t)t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.dataset.theme=t})()`,
          }}
        />
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
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is VEQT?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "VEQT (Vanguard All-Equity ETF Portfolio) is a single-ticket ETF that provides instant exposure to approximately 13,700 stocks across 50 countries. It holds 4 underlying Vanguard index ETFs covering the US (~43%), Canada (~31%), international developed (~18%), and emerging markets (~7%). It is designed for long-term Canadian passive investors.",
                },
              },
              {
                "@type": "Question",
                name: "What is VEQT's MER?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "VEQT's MER is approximately 0.20%. Vanguard reduced the management fee from 0.22% to 0.17% in November 2025. The official MER was last reported as 0.24% based on a prior fiscal year and is expected to be approximately 0.19-0.20% once recalculated.",
                },
              },
              {
                "@type": "Question",
                name: "Should I hold VEQT in a TFSA or RRSP?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "For most Canadians, especially younger investors, holding VEQT in a TFSA is recommended. All growth and distributions are completely tax-free. Higher-income earners may benefit from the RRSP tax deduction. Non-registered accounts should only be used after registered accounts are maxed.",
                },
              },
              {
                "@type": "Question",
                name: "What is the difference between VEQT and XEQT?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Both are all-equity, globally diversified single-ticket ETFs with identical management fees (0.17%) and effectively identical MERs (~0.20%). XEQT (iShares) has slightly more US exposure (~45% vs ~43%). VEQT (Vanguard) has more Canadian exposure (~31% vs ~25%). Performance has been very similar. The differences are small enough that most investors won't notice over a 20-year horizon.",
                },
              },
              {
                "@type": "Question",
                name: "How often does VEQT pay distributions?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "VEQT pays one annual distribution, typically with an ex-dividend date in late December and payment in early January. The most recent confirmed distribution was $0.76018 per unit (December 2025).",
                },
              },
            ],
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "InvestmentFund",
            name: "Vanguard All-Equity ETF Portfolio",
            alternateName: "VEQT",
            tickerSymbol: "VEQT.TO",
            exchange: "Toronto Stock Exchange",
            url: "https://www.vanguard.ca/en/advisor/products/products-group/etfs/VEQT",
            description:
              "A single-ticket, globally diversified, all-equity ETF holding approximately 13,700 stocks across 50 countries through 4 underlying Vanguard index ETFs.",
            provider: {
              "@type": "Organization",
              name: "Vanguard Investments Canada Inc.",
            },
            feesAndCommissionsSpecification:
              "Management Expense Ratio (MER) approximately 0.20%. Management fee reduced to 0.17% in November 2025.",
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
