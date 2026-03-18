import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  basePath: '/dbal',
  transpilePackages: [
    '@metabuilder/api-clients',
    '@metabuilder/core-hooks',
    '@metabuilder/hooks-async',
    '@metabuilder/redux-slices',
  ],
}

export default nextConfig
