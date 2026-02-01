/** @type {import('next').NextConfig} */
const path = require('path');

const fakeMuiPath = path.resolve(__dirname, '../fakemui');
const m3ScssPath = path.resolve(__dirname, '../fakemui/scss/m3-scss');

const nextConfig = {
  reactStrictMode: true,
  // typedRoutes moved from experimental to top-level in Next.js 16
  typedRoutes: true,
  // Transpile local packages
  transpilePackages: ['@metabuilder/fakemui'],
  sassOptions: {
    includePaths: [
      m3ScssPath,
      path.resolve(__dirname, '../fakemui/scss')
    ],
    silenceDeprecations: ['legacy-js-api', 'import']
  },
  webpack: (config, { isServer }) => {
    // Add alias for @metabuilder/fakemui and subpaths
    config.resolve.alias['@metabuilder/fakemui'] = fakeMuiPath;
    config.resolve.alias['@metabuilder/fakemui/scss'] = path.join(fakeMuiPath, 'scss/index.scss');
    config.resolve.alias['@metabuilder/fakemui/icons'] = path.join(fakeMuiPath, 'icons/index.ts');
    config.resolve.alias['@metabuilder/fakemui/hooks'] = path.join(fakeMuiPath, 'hooks.ts');
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

module.exports = nextConfig;
