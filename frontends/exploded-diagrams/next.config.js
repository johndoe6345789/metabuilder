/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/diagrams',
  output: 'standalone',
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
}

module.exports = nextConfig
