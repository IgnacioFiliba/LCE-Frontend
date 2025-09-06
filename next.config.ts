import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://pf-grupo5-8.onrender.com/api/:path*", // ← AGREGAR /api
      },
    ]
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
