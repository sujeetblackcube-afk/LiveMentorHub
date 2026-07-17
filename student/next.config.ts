import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/student",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  devIndicators: false, 
  allowedDevOrigins: ['192.168.31.215', 'localhost'],
};

export default nextConfig;