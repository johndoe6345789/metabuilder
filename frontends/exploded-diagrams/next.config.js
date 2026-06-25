/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/diagrams',
  output: 'standalone',
  allowedDevOrigins: ['metabuilder.wardcrew.com', 'wardcrew.com'],
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
}

module.exports = nextConfig
