import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://lce-backend-y3dp.onrender.com/api/:path*", // ← AGREGAR /api
      },
    ]
  },
  images: {
    unoptimized: true,
    domains: ['res.cloudinary.com'],
  },
}

export default nextConfig
