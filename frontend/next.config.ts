import type { NextConfig } from "next";
const runtimeCaching = require("next-pwa/cache");

// @ts-ignore
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching,
});

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // reactCompiler: true, 
  },
};

export default withPWA(nextConfig);
