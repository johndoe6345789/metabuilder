/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,

  // External packages
  transpilePackages: ['@metabuilder/fakemui', '@metabuilder/redux-core'],

  // API proxy for development
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/api/v1/:path*',
          destination: 'http://localhost:3001/api/v1/:path*',
          has: [
            {
              type: 'query',
              key: 'bypass',
              value: 'false'
            }
          ]
        }
      ]
    }
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_BASE_URL || 'http://localhost:3000'
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          }
        ]
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

  // Content Security Policy
  async redirects() {
    return [
      {
        source: '/email',
        destination: '/',
        permanent: false
      }
    ]
  },

  // Webpack optimization
  webpack: (config, { isServer }) => {
    // Optimization for large bundles
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              filename: 'static/chunks/vendor.js',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            // Separate chunk for common modules
            common: {
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              filename: 'static/chunks/common.js'
            }
          }
        }
      }
    }

    return config
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  // Compression
  compress: true,

  // Custom server logs
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5
  },

  // Experimental features (optional)
  experimental: {
    optimizePackageImports: ['@metabuilder/fakemui']
  }
}

export default nextConfig
