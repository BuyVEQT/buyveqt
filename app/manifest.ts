import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo-config";

/**
 * Web App Manifest. Generated at build time and served at /manifest.webmanifest.
 *
 * Makes the site installable (Add to Home Screen / Install app) on browsers
 * that support PWA install prompts. We're not shipping any offline behavior
 * or service worker — installed users get a chrome-less window pointing at
 * the live site. Useful for power users who pin the dashboard.
 *
 * Colors:
 *   theme_color    — Instrument ink (matches the masthead); URL bar tint on Android
 *   background_color — Instrument paper; flashes before the install icon resolves
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "BuyVEQT",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "minimal-ui",
    background_color: "#ffffff",
    theme_color: "#111111",
    orientation: "any",
    icons: [
      {
        src: "/icon.svg",
        sizes: "32x32",
        type: "image/svg+xml",
      },
      {
        // app/apple-icon.tsx generates this — Next inserts the right
        // MIME and dimensions automatically.
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["finance", "education"],
    lang: "en-CA",
  };
}
