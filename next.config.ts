import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
