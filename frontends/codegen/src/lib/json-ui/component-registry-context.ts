/**
 * Webpack require.context instances for lazy component loading.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const webpackRequire = require as any

export const atomContext = webpackRequire.context(
  '@/components/atoms',
  false,
  /\.tsx$/,
) as __WebpackModuleApi.RequireContext

export const moleculeContext = webpackRequire.context(
  '@/components/molecules',
  false,
  /\.tsx$/,
) as __WebpackModuleApi.RequireContext

export const organismContext = webpackRequire.context(
  '@/components/organisms',
  false,
  /\.tsx$/,
) as __WebpackModuleApi.RequireContext

export const explicitContext = webpackRequire.context(
  '@/components',
  true,
  /\.tsx$/,
) as __WebpackModuleApi.RequireContext
