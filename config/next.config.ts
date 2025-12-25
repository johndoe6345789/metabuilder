import type { NextConfig } from 'next'
import { resolve } from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Standalone output for Docker
  output: 'standalone',
  
  // Configure page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  
  // Experimental features
  experimental: {
    // Enable React Server Components
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3000'],
    },
    // Optimize package imports
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-data-grid',
      '@mui/x-date-pickers',
      'recharts',
      'd3',
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
  
  // Turbopack configuration (empty for now, migrations from webpack can be added later)
  turbopack: {},
  
  // Redirects for old routes (if needed)
  async redirects() {
    return []
  },
  
  // Headers for security and CORS
  async headers() {
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
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  
  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_DBAL_API_URL: process.env.DBAL_API_URL || 'http://localhost:8080',
  },
}

export default nextConfig
