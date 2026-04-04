import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['@x-track/firebase', '@x-track/ui'],
  webpack(config) {
    // Force all React imports to resolve to the single root copy,
    // preventing dual-instance errors in monorepos.
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
    };
    return config;
  },
};

export default nextConfig;
