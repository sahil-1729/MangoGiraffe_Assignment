/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/upload/:path*",
        destination: "https://dg-sandbox.setu.co/:path*",
      },
    ];
  },
};

export default nextConfig;
