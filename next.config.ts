// next.config.ts
import type { NextConfig } from 'next';

// For custom domain deployment (www.hankendi.com) we serve at domain root,
// so remove basePath/assetPrefix previously used for GitHub project pages.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
};

export default nextConfig;
