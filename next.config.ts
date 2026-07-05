import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  env: {
    // Changes every build — forces sw.js to be byte-different so browsers
    // detect the update immediately instead of serving stale caches
    NEXT_PUBLIC_BUILD_ID: Date.now().toString(36),
  },
};

export default withSerwist(nextConfig);
