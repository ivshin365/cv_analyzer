import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages use Node built-ins / large bundles and must run as native
  // server externals rather than being bundled for the serverless runtime.
  serverExternalPackages: ["@react-pdf/renderer", "unpdf", "mammoth"],
};

export default nextConfig;
