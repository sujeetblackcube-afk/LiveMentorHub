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
        source: '/student/auth/:path*',
        destination: '/auth/:path*',
      },
      {
        source: '/student/dashboard',
        destination: '/dashboard',
      },
      {
        source: '/student/live',
        destination: '/live',
      },
      {
        source: '/student/courses',
        destination: '/courses',
      },
      {
        source: '/student/courses/:path*',
        destination: '/courses/:path*',
      },
      {
        source: '/student/tests',
        destination: '/tests',
      },
      {
        source: '/student/tests/:path*',
        destination: '/tests/:path*',
      },
      {
        source: '/student/doubt',
        destination: '/doubt',
      },
      {
        source: '/student/settings',
        destination: '/settings',
      },
      {
        source: '/student/:path*',
        destination: '/:path*',
      },
    ];
  },
};

export default nextConfig;