import path from 'path';
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      oracledb: path.resolve(__dirname, 'node_modules/oracledb'),
    };
    return config;
  },
};

export default nextConfig;
