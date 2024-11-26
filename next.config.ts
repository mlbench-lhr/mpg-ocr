import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['oracledb'],
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'oracledb'];
    return config;
  },
};

export default nextConfig;
