import path from 'path';
import type { NextConfig } from "next";

const projectDir = process.cwd();
const monorepoRoot = path.resolve(projectDir, '../../../');

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/terminal',
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ['@metabuilder/components'],
  sassOptions: {
    loadPaths: [
      path.join(monorepoRoot, 'scss/m3-scss'),
      path.join(monorepoRoot, 'scss'),
    ],
    includePaths: [
      path.join(monorepoRoot, 'scss/m3-scss'),
      path.join(monorepoRoot, 'scss'),
    ],
    silenceDeprecations: ['legacy-js-api', 'import'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
