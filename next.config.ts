import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "waytocrete.com" }],
  },
  async redirects() {
    return [
      { source: "/b2b", destination: "/en/partners", permanent: false },
      { source: "/:lang/b2b", destination: "/:lang/partners", permanent: false },
    ];
  },
};

export default nextConfig;
