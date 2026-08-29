/** Page title and description for an entity route. */

import type { EntityPageProps } from './entity-page-props'



export async function generateMetadata({ params }: EntityPageProps) {
  const { tenantSlug, package: pkg, slug } = await params
  const entity = slug[0] ?? 'unknown'
  const id = slug[1]

  let title = `${entity} - ${pkg}`
  if (id === 'new') {
    title = `New ${entity} - ${pkg}`
  } else if (id !== undefined) {
    title = `${entity} #${id} - ${pkg}`
  }

  return {
    title: `${title} | ${tenantSlug} | MetaBuilder`,
  }
}
