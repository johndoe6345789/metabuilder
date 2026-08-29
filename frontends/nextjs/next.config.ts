import type { NextConfig } from 'next'
import type { Configuration } from 'webpack'
import type webpack from 'webpack'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const projectDir = fileURLToPath(new URL('.', import.meta.url))
const monorepoRoot = path.resolve(projectDir, '../..')

// Read version from monorepo root package.json at build time
const rootPkg = JSON.parse(
  fs.readFileSync(path.join(monorepoRoot, 'package.json'), 'utf8')
) as { version?: string }
const APP_VERSION = rootPkg.version ?? '0.1.0'

const nextConfig: NextConfig = {
  basePath: '/app',
  reactStrictMode: true,

  // Standalone output for Docker
  output: 'standalone',

  // Configure page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  // Resolve SCSS @use 'cdk' from m3 components.
  // loadPaths is for Turbopack; includePaths is the webpack fallback.
  sassOptions: {
    loadPaths: [
      path.join(monorepoRoot, 'libraries/scss/m3-scss'),
      path.join(monorepoRoot, 'libraries/scss'),
    ],
    includePaths: [
      path.join(monorepoRoot, 'libraries/scss/m3-scss'),
      path.join(monorepoRoot, 'libraries/scss'),
    ],
    silenceDeprecations: ['legacy-js-api', 'import'],
  },
  transpilePackages: [
    '@metabuilder/dbal-sso',
    '@metabuilder/m3',
    '@metabuilder/redux-persist',
    '@metabuilder/service-adapters',
  ],

  // Experimental features
  experimental: {
    // Enable React Server Components
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3000'],
    },
    // Optimize package imports - reduces bundle size significantly
    optimizePackageImports: ['recharts', 'd3', 'lodash-es', 'date-fns'],
  },

  // Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
    ],
  },

  // Headers for security and CORS
  headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ]
  },

  // TypeScript configuration
  //
  // Type errors fail the build. This was `true`, which meant a build could
  // ship code `tsc` rejects -- the CI typecheck was the only thing catching
  // them, and only if it ran first.
  typescript: {
    ignoreBuildErrors: false,
  },
  // Environment variables exposed to browser
  env: {
    // NEXT_PUBLIC_DBAL_API_URL: browser-visible URL set at build time via ARG
    // Falls back to DBAL_API_URL (server-internal, unusable by browser)
    NEXT_PUBLIC_DBAL_API_URL:
      process.env.NEXT_PUBLIC_DBAL_API_URL ??
      process.env.DBAL_API_URL ??
      'http://localhost:8080',
    NEXT_PUBLIC_DBAL_WS_URL: process.env.DBAL_WS_URL ?? 'ws://localhost:50051',
    NEXT_PUBLIC_DBAL_API_KEY: process.env.DBAL_API_KEY ?? '',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? APP_VERSION,
  },
  // Turbopack config (used by `next dev --turbopack`)
  // webpack() callback below is still used by `next build`
  turbopack: {
    root: path.resolve(projectDir, '../..'),
    resolveAlias: {
      '@dbal-ui': path.resolve(projectDir, '../../dbal/shared/ui'),
    },
  },
  webpack(
    config: Configuration,
    { isServer, webpack: wp }: { isServer: boolean; webpack: typeof webpack }
  ) {
    // Stub external SCSS modules with an actual .module.scss so
    // css-loader sets `.default` correctly.
    const stubScss = path.resolve(projectDir, 'src/lib/empty.module.scss')
    config.plugins ??= []
    config.plugins.push(
      new wp.NormalModuleReplacementPlugin(
        /\.module\.scss$/,
        function (resource: { context?: string; request?: string }) {
          const ctx = resource.context ?? ''
          if (!ctx.includes(path.join('frontends', 'nextjs', 'src'))) {
            resource.request = stubScss
          }
        }
      )
    )
    if (config.optimization != null) {
      config.optimization.minimize = false
    }

    if (config.resolve != null) {
      config.resolve.alias = {
        ...(config.resolve.alias as Record<string, string>),
        '@dbal-ui': path.resolve(projectDir, '../../dbal/shared/ui'),
        // Resolve service-adapters to source (dist/ is not pre-built)
        '@metabuilder/service-adapters': path.resolve(
          monorepoRoot,
          'redux/adapters/src'
        ),
      }
    }

    config.externals = [...(config.externals as string[]), 'esbuild']

    if (!isServer) {
      if (config.resolve != null) {
        config.resolve.fallback = {
          ...(config.resolve.fallback as Record<string, false>),
          '@aws-sdk/client-s3': false,
          fs: false,
          path: false,
          crypto: false,
          stream: false,
          'stream/promises': false,
          os: false,
          buffer: false,
          util: false,
        }
      }
    }

    return config
  },
}

export default nextConfig
