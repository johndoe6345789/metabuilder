/** @type {import('next').NextConfig} */
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const m3Path = resolve(__dirname, '../../libraries/components/m3');
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
    '@metabuilder/m3',
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
      '@metabuilder/m3': './libraries/components/m3',
      '@metabuilder/m3/scss': './libraries/components/m3/scss/index.scss',
      '@metabuilder/m3/icons': './libraries/components/m3/icons/index.ts',
      '@metabuilder/m3/hooks': './libraries/components/m3/hooks.ts',
      // Components — resolve to source
      '@metabuilder/components': './libraries/components/index.tsx',
      '@metabuilder/components/cards': './libraries/components/cards/index.ts',
      '@metabuilder/components/layout': './libraries/components/layout/index.ts',
      '@metabuilder/components/navigation': './libraries/components/navigation/index.ts',
      '@metabuilder/components/feedback': './libraries/components/feedback/index.ts',
      '@metabuilder/components/workflow-editor': './libraries/components/workflow-editor/index.ts',
      // Redux
      '@metabuilder/api-clients': './libraries/redux/api-clients/src',
      // Hooks
      '@metabuilder/hooks': './libraries/hooks/src',
      '@metabuilder/hooks/workflow-editor': './libraries/hooks/workflow-editor/index.ts',
      // Shared SCSS modules
      '@scss': './libraries/scss',
      // Shared icon exports
      '@icons': './libraries/icons',
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
    // Add alias for @metabuilder/m3 and subpaths
    config.resolve.alias['@metabuilder/m3'] = m3Path;
    config.resolve.alias['@metabuilder/m3/scss'] = join(m3Path, 'scss/index.scss');
    config.resolve.alias['@metabuilder/m3/icons'] = join(m3Path, 'icons/index.ts');
    config.resolve.alias['@metabuilder/m3/hooks'] = join(m3Path, 'hooks.ts');

    // Resolve @metabuilder/api-clients to source (not dist/) so transpilePackages works on live code
    config.resolve.alias['@metabuilder/api-clients'] = resolve(__dirname, '../../libraries/redux/api-clients/src');

    // Resolve @metabuilder/components to source (package.json exports point to .ts/.tsx)
    config.resolve.alias['@metabuilder/components/cards'] = join(componentsPath, 'cards/index.ts');
    config.resolve.alias['@metabuilder/components/layout'] = join(componentsPath, 'layout/index.ts');
    config.resolve.alias['@metabuilder/components/navigation'] = join(componentsPath, 'navigation/index.ts');
    config.resolve.alias['@metabuilder/components/feedback'] = join(componentsPath, 'feedback/index.ts');
    config.resolve.alias['@metabuilder/components/workflow-editor'] = join(componentsPath, 'workflow-editor/index.ts');
    config.resolve.alias['@metabuilder/components'] = join(componentsPath, 'index.tsx');
    config.resolve.alias['@metabuilder/hooks/workflow-editor'] = resolve(__dirname, '../../libraries/hooks/workflow-editor/index.ts');
    config.resolve.alias['@scss'] = resolve(__dirname, '../../libraries/scss');
    config.resolve.alias['@icons'] = resolve(__dirname, '../../libraries/icons');

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
