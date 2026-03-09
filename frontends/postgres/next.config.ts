import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import './src/libs/Env';

const monorepoRoot = path.resolve(__dirname, '../..');

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  basePath: '/postgres',
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ];
  },
  devIndicators: {
    position: 'bottom-right',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  reactCompiler: true,
  outputFileTracingIncludes: {
    '/': ['./migrations/**/*'],
  },
  sassOptions: {
    includePaths: [
      path.join(monorepoRoot, 'scss'),
      path.join(monorepoRoot, 'scss/m3-scss'),
      path.join(monorepoRoot, 'scss/m3-scss/material'),
      path.join(monorepoRoot, 'scss/m3-scss/cdk'),
      path.join(monorepoRoot, 'scss/atoms'),
      path.join(monorepoRoot, 'scss/mixins'),
    ],
  },
  transpilePackages: ['@metabuilder/fakemui'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Turbopack config (used by `next dev --turbopack`)
  // webpack() callback below is still used by `next build`
  turbopack: {
    root: monorepoRoot,
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    const webpack = require('webpack')
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /\.module\.scss$/,
        function (resource: any) {
          if (resource.context?.includes('fakemui') ||
              resource.context?.includes('components/dist') ||
              resource.context?.includes('components\\dist')) {
            resource.request = require.resolve('./src/lib/empty-css-module.js')
          }
        }
      )
    )
    config.optimization.minimize = false
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, path: false, crypto: false,
      }
    }
    config.externals = [...(config.externals || []),
      'better-sqlite3', '.prisma/client/index-browser',
    ]
    return config
  },
};

// Initialize the Next-Intl plugin
let configWithPlugins = createNextIntlPlugin('./src/libs/I18n.ts')(baseConfig);

// Conditionally enable bundle analysis
if (process.env.ANALYZE === 'true') {
  configWithPlugins = withBundleAnalyzer()(configWithPlugins);
}

// Conditionally enable Sentry configuration
if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options
    org: process.env.SENTRY_ORGANIZATION,
    project: process.env.SENTRY_PROJECT,

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    reactComponentAnnotation: {
      enabled: true,
    },

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Disable Sentry telemetry
    telemetry: false,
  });
}

const nextConfig = configWithPlugins;
export default nextConfig;
