import * as path from 'path'

/** Consistent path resolution for the schema registry, relative to the
 *  Next.js app's own cwd rather than the monorepo root. */
export const getRegistryPath = () =>
  path.join(process.cwd(), '..', '..', '..', 'schema', 'schema-registry.json')

export const getSchemaOutputPath = () =>
  path.join(
    process.cwd(),
    '..',
    '..',
    '..',
    'schema',
    'generated-from-packages.schema'
  )
