/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    typedRoutes: true
  },
  sassOptions: {
    includePaths: [
      path.resolve(__dirname, '../fakemui/scss/m3-scss')
    ]
  },
  webpack: (config, { isServer }) => {
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
