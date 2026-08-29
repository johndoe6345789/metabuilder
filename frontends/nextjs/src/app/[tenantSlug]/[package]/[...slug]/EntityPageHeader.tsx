/** Breadcrumb and title above every entity view. */

import type { EntitySchema } from '@/lib/entities/load-entity-schema'

export function EntityPageHeader({
  tenantSlug,
  pkg,
  entity,
  id,
  schema,
}: {
  tenantSlug: string
  pkg: string
  entity: string
  id: string | undefined
  schema: EntitySchema | null
}) {
  return (
  <header className="entity-header">
    <nav className="breadcrumb">
      <a href={`/${tenantSlug}/${pkg}`}>{pkg}</a>
      {' / '}
      <span>{entity}</span>
      {id !== undefined && id !== 'new' && (
        <>
          {' / '}
          <span>{id}</span>
        </>
      )}
    </nav>

    <h1>{schema?.displayName ?? entity}</h1>
    {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
    {schema?.description !== null && schema?.description !== undefined && (
      <p>{schema.description}</p>
    )}
  </header>
  )
}
