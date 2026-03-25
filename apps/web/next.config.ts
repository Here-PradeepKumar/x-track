import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@x-track/firebase', '@x-track/ui'],
};

export default nextConfig;
