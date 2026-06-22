/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  experimental: {},
  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig
