import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from Cloudinary and Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // Transpile the shared package
  transpilePackages: ["@buddyacross/shared"],

  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
