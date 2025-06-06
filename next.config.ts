import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // static export (no server)
};

if (process.env.NODE_ENV === "production") {
  nextConfig.basePath = "/platform-data"; // for github pages
}

export default nextConfig;
