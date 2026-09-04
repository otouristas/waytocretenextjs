import type { NextConfig } from "next";
import { contentRedirects } from "./lib/content/redirects";

const nextConfig: NextConfig = {
  images: {
    // TEMPORARY: tour imagery is still hot-linked from the sister WordPress
    // site. The media pipeline (scripts/media-build.ts) self-hosts these; drop
    // this pattern once it has run, so the new site owns its own assets and
    // its LCP no longer depends on someone else's server.
    remotePatterns: [{ protocol: "https", hostname: "waytocrete.com", pathname: "/wp-content/uploads/**" }],
    formats: ["image/avif", "image/webp"],
  },
  // These are permanent slug corrections. They were 302s, which neither
  // consolidate signals onto the canonical URL nor get treated as final.
  async redirects() {
    return [
      { source: "/b2b", destination: "/en/partners", permanent: true },
      { source: "/:lang/b2b", destination: "/:lang/partners", permanent: true },
      { source: "/:lang/tours/elafonisi-pink-sand", destination: "/:lang/tours/elafonisi-pink-sand-beach-tour-from-rethymno", permanent: true },
      { source: "/:lang/tours/imbros-gorge", destination: "/:lang/tours/imbros-gorge-guided-tour", permanent: true },
      { source: "/:lang/tours/knossos-palace-private", destination: "/:lang/tours/knossos-palace-private-tour", permanent: true },
      { source: "/:lang/tours/shepherd-for-a-day", destination: "/:lang/tours/shepherd-for-a-day-crete", permanent: true },

      // Generated from each content file's `supersedes` array, so merged and
      // renamed pages keep their 301s without a hand-maintained list.
      ...contentRedirects(),
    ];
  },
};

export default nextConfig;
