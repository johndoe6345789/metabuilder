/** EntityListView. */

import { EntityTable } from './EntityTable'
import { SOFT_RADIUS, SOFT_PILL_RADIUS } from './radii'
import { fetchEntityList } from '@/lib/entities/api-client'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

export async function EntityListView({
  tenant,
  pkg,
  entity,
  schema,
}: {
  tenant: string
  pkg: string
  entity: string
  schema: EntitySchema | null
}) {
  const apiUrl = `/api/v1/${tenant}/${pkg}/${entity}`

  // Fetch entity list
  const response = await fetchEntityList(tenant, pkg, entity)

  return (
    <div className="entity-list">
      <div
        className="list-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h2>{entity} List</h2>
        <a
          href={`/${tenant}/${pkg}/${entity}/new`}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: SOFT_PILL_RADIUS,
          }}
        >
          + New {entity}
        </a>
      </div>

      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
        API: <code>{apiUrl}</code>
      </p>

      {response.error !== undefined ? (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#ffebee',
            borderRadius: SOFT_RADIUS,
            color: '#c62828',
          }}
        >
          Error loading data: {response.error}
        </div>
      ) : (
        <div
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: SOFT_RADIUS,
            overflow: 'hidden',
          }}
        >
          <EntityTable
            schema={schema ?? null}
            rows={(response.data ?? []) as Record<string, unknown>[]}
            tenant={tenant}
            pkg={pkg}
            entity={entity}
          />
        </div>
      )}
    </div>
  )
}
