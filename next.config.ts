import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel deployment optimizations */
  
  // Enable SWR (Stale-While-Revalidate) for better caching
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.lh.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.clerk.com",
      },
    ],
  },

  // Headers for security and CORS
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Redirects for common paths
  async redirects() {
    return [
      {
        source: "/dashboard/:path*",
        destination: "/dashboard",
        permanent: false,
        has: [
          {
            type: "query",
            key: "redirect",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
