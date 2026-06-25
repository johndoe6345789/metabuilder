/** @type {import('next').NextConfig} */
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const fakeMuiPath = resolve(__dirname, '../../libraries/components/fakemui');
const componentsPath = resolve(__dirname, '../../libraries/components');
const m3ScssPath = resolve(__dirname, '../../libraries/scss/m3-scss');

const nextConfig = {
  basePath: '/workflowui',
  output: 'standalone',
  allowedDevOrigins: ['metabuilder.wardcrew.com', 'wardcrew.com'],
  reactStrictMode: true,
  // typedRoutes moved from experimental to top-level in Next.js 16
  typedRoutes: true,
  // Transpile local packages
  transpilePackages: [
    '@metabuilder/fakemui',
    '@metabuilder/api-clients',
    '@metabuilder/redux-persist',
    '@metabuilder/components',
    '@metabuilder/hooks',
    '@metabuilder/services',
    '@metabuilder/interfaces',
  ],
  // Turbopack config — paths MUST be relative to turbopack root (monorepo root)
  turbopack: {
    root: resolve(__dirname, '../..'),
    resolveAlias: {
      // FakeMUI
      '@metabuilder/fakemui': './libraries/components/fakemui',
      '@metabuilder/fakemui/scss': './libraries/components/fakemui/scss/index.scss',
      '@metabuilder/fakemui/icons': './libraries/components/fakemui/icons/index.ts',
      '@metabuilder/fakemui/hooks': './libraries/components/fakemui/hooks.ts',
      // Components — resolve to source
      '@metabuilder/components': './libraries/components/index.tsx',
      '@metabuilder/components/cards': './libraries/components/cards/index.ts',
      '@metabuilder/components/layout': './libraries/components/layout/index.ts',
      '@metabuilder/components/navigation': './libraries/components/navigation/index.ts',
      // Redux
      '@metabuilder/api-clients': './libraries/redux/api-clients/src',
      // Hooks
      '@metabuilder/hooks': './libraries/hooks/src',
    },
  },
  sassOptions: {
    // Load paths for Angular Material SCSS - order matters!
    // m3-scss must be first so 'cdk' resolves to m3-scss/cdk
    loadPaths: [
      resolve(__dirname, '../../libraries/scss/m3-scss'),
      resolve(__dirname, '../../libraries/scss'),
    ],
    includePaths: [
      resolve(__dirname, '../../libraries/scss/m3-scss'),
      m3ScssPath,
      resolve(__dirname, '../../libraries/scss'),
    ],
    silenceDeprecations: ['legacy-js-api', 'import']
  },
  webpack: (config, { isServer }) => {
    // Add alias for @metabuilder/fakemui and subpaths
    config.resolve.alias['@metabuilder/fakemui'] = fakeMuiPath;
    config.resolve.alias['@metabuilder/fakemui/scss'] = join(fakeMuiPath, 'scss/index.scss');
    config.resolve.alias['@metabuilder/fakemui/icons'] = join(fakeMuiPath, 'icons/index.ts');
    config.resolve.alias['@metabuilder/fakemui/hooks'] = join(fakeMuiPath, 'hooks.ts');

    // Resolve @metabuilder/api-clients to source (not dist/) so transpilePackages works on live code
    config.resolve.alias['@metabuilder/api-clients'] = resolve(__dirname, '../../libraries/redux/api-clients/src');

    // Resolve @metabuilder/components to source (package.json exports point to .ts/.tsx)
    config.resolve.alias['@metabuilder/components/cards'] = join(componentsPath, 'cards/index.ts');
    config.resolve.alias['@metabuilder/components/layout'] = join(componentsPath, 'layout/index.ts');
    config.resolve.alias['@metabuilder/components/navigation'] = join(componentsPath, 'navigation/index.ts');
    config.resolve.alias['@metabuilder/components'] = join(componentsPath, 'index.tsx');

    // Exclude Prisma client from browser bundle (dev uses IndexedDB only)
    // Prisma adapter is loaded via dynamic import() - webpack won't bundle unless used
    if (!isServer) {
      config.resolve.alias['@prisma/client'] = false;
      config.resolve.alias['.prisma/client'] = false;
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false
    };
    return config;
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000'
  }
};

export default nextConfig;
