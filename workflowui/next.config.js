/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    typedRoutes: true
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
