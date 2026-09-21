import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: isGitHubPages ? 'export' : undefined,
  basePath: isGitHubPages ? '/nari-lab' : '',
  assetPrefix: isGitHubPages ? '/nari-lab/' : '',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
