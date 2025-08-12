import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pt123.cdn.static123.com',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
