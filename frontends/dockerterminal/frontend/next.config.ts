import path from 'path';
import type { NextConfig } from "next";

const projectDir = process.cwd();
const monorepoRoot = path.resolve(projectDir, '../../../');

const scssPaths = [
  path.join(monorepoRoot, 'libraries/scss'),
  path.join(monorepoRoot, 'libraries/scss/m3-scss'),
  path.join(monorepoRoot, 'libraries/scss/m3-scss/material'),
  path.join(monorepoRoot, 'libraries/scss/m3-scss/cdk'),
  path.join(monorepoRoot, 'libraries/scss/atoms'),
  path.join(monorepoRoot, 'libraries/scss/mixins'),
];

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/terminal',
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ['@metabuilder/components', '@metabuilder/m3', '@metabuilder/dbal-sso'],
  sassOptions: {
    loadPaths: scssPaths,
    includePaths: scssPaths,
    silenceDeprecations: ['legacy-js-api', 'import'],
  },
  // Turbopack drives `next build`; the m3 source alias must live here
  // (turbopack ignores webpack()). Values are project-relative.
  turbopack: {
    root: monorepoRoot,
    resolveAlias: {
      '@metabuilder/components/m3': '../../../libraries/components/m3',
      '@metabuilder/m3': '../../../libraries/components/m3',
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
