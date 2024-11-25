import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['oracledb'], // Mark oracledb as external
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'oracledb']; // Explicitly exclude oracledb from bundling
    return config;
  },
};

export default nextConfig;
