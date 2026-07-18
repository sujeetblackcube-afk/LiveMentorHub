import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  devIndicators: false, 
  allowedDevOrigins: ['192.168.31.215', 'localhost'],
  async rewrites() {
    return [
      {
        source: '/student',
        destination: '/',
      },
      {
        source: '/student/:path*',
        destination: '/:path*',
      },
    ];
  },
};

export default nextConfig;