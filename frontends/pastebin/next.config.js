/** @type {import('next').NextConfig} */
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const componentsPath = resolve(__dirname, '../../libraries/components');

const nextConfig = {
  basePath: '/pastebin',
  output: 'standalone',
  allowedDevOrigins: ['metabuilder.wardcrew.com', 'wardcrew.com'],
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
    '@metabuilder/m3',
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
      resolve(__dirname, '../../libraries/scss/m3-scss'),
      resolve(__dirname, '../../libraries/scss'),
    ],
    includePaths: [
      './src/styles',
      resolve(__dirname, '../../libraries/scss/m3-scss'),
      resolve(__dirname, '../../libraries/scss'),
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
  webpack: (config, { isServer }) => {
    // Resolve @metabuilder/components to source
    config.resolve.alias['@metabuilder/components'] = join(componentsPath, 'index.tsx');

    // Add m3 alias to match workflowui pattern
    const m3Path = resolve(__dirname, '../../libraries/components/m3');
    config.resolve.alias['@metabuilder/m3'] = m3Path;

    // Resolve @metabuilder/components/m3 subpath (used by migrated components)
    config.resolve.alias['@metabuilder/components/m3'] = join(m3Path, 'index.ts');

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
