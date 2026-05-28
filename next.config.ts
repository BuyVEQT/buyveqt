import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // recharts re-exports a wide surface from its barrel; without this, any
    // chunk that touches it pulls a large slice (plus d3 deps). Scopes the
    // import to just what's used.
    optimizePackageImports: ["recharts"],
  },
  async redirects() {
    return [
      {
        // /today's daily-snapshot purpose was folded into the
        // broadsheet home page. Keep the URL alive for backlinks and
        // bookmarks; preserve SEO equity with a permanent redirect.
        source: "/today",
        destination: "/",
        permanent: true,
      },
      {
        // /invest was renamed to /calculators. Next redirects preserve
        // query strings by default, so /invest?tab=historical&amount=10000
        // still lands on /calculators with the same params. Replaces the
        // page-level redirect at app/invest/page.tsx; the early 308 from
        // next.config skips a server round-trip per request.
        source: "/invest",
        destination: "/calculators",
        permanent: true,
      },
      {
        source: "/learn/why-we-choose-veqt-over-xeqt",
        destination: "/learn/veqt-vs-xeqt",
        permanent: true,
      },
      {
        source: "/learn/what-you-actually-own",
        destination: "/learn/what-is-veqt",
        permanent: true,
      },
      {
        source: "/learn/how-veqt-rebalances",
        destination: "/learn/veqt-vs-diy-portfolio",
        permanent: true,
      },
      {
        // XGRO was retired from the compare lineup when Avantis CAGE took its
        // matchup slot. VGRO is XGRO's closest peer (both 80/20 equity/bond),
        // so route old XGRO links to the Vanguard counterpart instead of
        // 404-ing — preserves inbound SEO and keeps the bond-tradeoff framing.
        source: "/compare/veqt-vs-xgro",
        destination: "/compare/veqt-vs-vgro",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
