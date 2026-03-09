/** @type {import('next').NextConfig} */
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const componentsPath = resolve(__dirname, '../../components');

const nextConfig = {
  basePath: '/pastebin',
  output: 'standalone',
  async rewrites() {
    // Proxy /pastebin-api/* → Flask backend (for direct port-3003 dev access).
    // In production, nginx handles this routing instead.
    const flaskUrl = process.env.FLASK_BACKEND_INTERNAL_URL || 'http://pastebin-backend:5000';
    return [
      { source: '/pastebin-api/:path*', destination: `${flaskUrl}/:path*`, basePath: false },
    ];
  },
  transpilePackages: [
    '@metabuilder/components',
    '@metabuilder/fakemui',
    '@metabuilder/redux-persist',
    '@metabuilder/redux-slices',
    '@metabuilder/redux-core',
    '@metabuilder/hooks',
    '@metabuilder/hooks-canvas',
    '@metabuilder/service-adapters',
    '@metabuilder/services',
    '@metabuilder/types',
  ],
  sassOptions: {
    loadPaths: [
      resolve(__dirname, '../../scss/m3-scss'),
      resolve(__dirname, '../../scss'),
    ],
    includePaths: [
      './src/styles',
      resolve(__dirname, '../../scss/m3-scss'),
      resolve(__dirname, '../../scss'),
    ],
    silenceDeprecations: ['legacy-js-api', 'import'],
  },
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },
  eslint: {
    // Linting is handled separately with direct ESLint invocation (eslint.config.mjs)
    // Disable Next.js ESLint wrapper to avoid compatibility issues with ESLint 9+ flat config
    ignoreDuringBuilds: true,
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
    ignoreBuildErrors: true,
  },
  // Turbopack config (used by `next dev --turbopack`)
  // webpack() callback below is still used by `next build`
  turbopack: {
    root: resolve(__dirname, '../..'),
  },
  webpack: (config, { webpack, isServer }) => {
    // Resolve @metabuilder/components to source
    config.resolve.alias['@metabuilder/components'] = join(componentsPath, 'index.tsx');

    // Add fakemui alias to match workflowui pattern
    const fakeMuiPath = resolve(__dirname, '../../components/fakemui');
    config.resolve.alias['@metabuilder/fakemui'] = fakeMuiPath;

    // Resolve @metabuilder/components/fakemui subpath (used by migrated components)
    config.resolve.alias['@metabuilder/components/fakemui'] = join(fakeMuiPath, 'index.ts');

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        path: false,
        fs: false,
        crypto: false,
      };
    }

    return config;
  },
};

export default nextConfig;
