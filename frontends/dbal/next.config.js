/** @type {import('next').NextConfig} */
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  basePath: '/dbal',
  transpilePackages: ['@metabuilder/dbal-sso'],
  // Matches pastebin's convention: @metabuilder/dbal-sso is a sibling
  // workspace package reached via a node_modules symlink to
  // ../../libraries/redux/dbal-sso -- Turbopack needs to know the
  // monorepo root explicitly to resolve it rather than treating it as
  // outside the project.
  turbopack: {
    root: resolve(__dirname, '..', '..'),
  },
}

export default nextConfig
