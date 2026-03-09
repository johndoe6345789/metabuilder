import type { NextConfig } from 'next'
import path from 'path'

const projectDir = process.cwd()
const monorepoRoot = path.resolve(projectDir, '../..')

const nextConfig: NextConfig = {
  basePath: '/app',
  reactStrictMode: true,

  // Standalone output for Docker
  output: 'standalone',

  // Configure page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  // Resolve SCSS @use 'cdk' from fakemui components
  sassOptions: {
    includePaths: [
      path.join(monorepoRoot, 'scss'),
      path.join(monorepoRoot, 'scss/m3-scss'),
    ],
  },
  transpilePackages: ['@metabuilder/fakemui', '@metabuilder/redux-persist', '@metabuilder/service-adapters'],
  
  // Experimental features
  experimental: {
    // Enable React Server Components
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3000'],
    },
    // Optimize package imports - reduces bundle size significantly
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-data-grid',
      '@mui/x-date-pickers',
      'recharts',
      'd3',
      'lodash-es',
      'date-fns',
    ],
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
  
  // Redirects for old routes (if needed)
  redirects() {
    return []
  },
  
  // Headers for security and CORS
  headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_DBAL_API_URL: process.env.DBAL_API_URL ?? 'http://localhost:8080',
    NEXT_PUBLIC_DBAL_WS_URL: process.env.DBAL_WS_URL ?? 'ws://localhost:50051',
    NEXT_PUBLIC_DBAL_API_KEY: process.env.DBAL_API_KEY ?? '',
  },
  // Turbopack config (used by `next dev --turbopack`)
  // webpack() callback below is still used by `next build`
  turbopack: {
    root: path.resolve(projectDir, '../..'),
    resolveAlias: {
      '@metabuilder/components': path.resolve(projectDir, 'src/lib/components-shim.ts'),
      '@dbal-ui': path.resolve(projectDir, '../../dbal/shared/ui'),
    },
  },
  webpack(config, { isServer, webpack }) {
    // Stub ALL external SCSS module imports with an actual .module.scss
    // so they go through the CSS module pipeline (css-loader sets .default correctly)
    const stubScss = path.resolve(projectDir, 'src/lib/empty.module.scss')
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /\.module\.scss$/,
        function (resource: any) {
          const ctx = resource.context || ''
          if (!ctx.includes(path.join('frontends', 'nextjs', 'src'))) {
            resource.request = stubScss
          }
        }
      )
    )
    config.optimization.minimize = false

    config.resolve.alias = {
      ...config.resolve.alias,
      '@metabuilder/components': path.resolve(projectDir, 'src/lib/components-shim.ts'),
      '@dbal-ui': path.resolve(projectDir, '../../dbal/shared/ui'),
      // Resolve service-adapters to source (dist/ is not pre-built)
      '@metabuilder/service-adapters': path.resolve(monorepoRoot, 'redux/adapters/src'),
    }

    config.externals = [...(config.externals || []), 'esbuild']

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
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

    return config
  },
}

export default nextConfig
