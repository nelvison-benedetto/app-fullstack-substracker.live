import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.substracker.live",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
