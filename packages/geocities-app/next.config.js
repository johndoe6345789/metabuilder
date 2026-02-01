/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow loading images from archive.org for classic gifs
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'web.archive.org',
      },
    ],
  },
};

module.exports = nextConfig;
