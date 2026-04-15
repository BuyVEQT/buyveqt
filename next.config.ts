import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
