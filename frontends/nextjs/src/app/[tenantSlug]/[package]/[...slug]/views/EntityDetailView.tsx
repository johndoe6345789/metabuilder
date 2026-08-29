/** EntityDetailView. */

import { EntityLoadError } from './EntityLoadError'
import { EntityDetailFields } from './EntityDetailFields'
import { SOFT_RADIUS, SOFT_PILL_RADIUS } from './radii'
import { fetchEntity } from '@/lib/entities/api-client'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

export async function EntityDetailView({
  tenant,
  pkg,
  entity,
  id,
  schema,
}: {
  tenant: string
  pkg: string
  entity: string
  id: string
  schema: EntitySchema | null
}) {
  const apiUrl = `/api/v1/${tenant}/${pkg}/${entity}/${id}`

  // Fetch entity data
  const response = await fetchEntity(tenant, pkg, entity, id)

  return (
    <div className="entity-detail">
      <div
        className="detail-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h2>
          {entity} #{id}
        </h2>
        <div className="actions">
          <a
            href={`/${tenant}/${pkg}/${entity}/${id}/edit`}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1976d2',
              color: 'white',
              textDecoration: 'none',
              borderRadius: SOFT_PILL_RADIUS,
            }}
          >
            Edit
          </a>
        </div>
      </div>

      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
        API: <code>{apiUrl}</code>
      </p>

      {response.error !== undefined ? (
        <EntityLoadError message={response.error} />
      ) : (
        <div
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: SOFT_RADIUS,
            padding: '1.5rem',
          }}
        >
          <EntityDetailFields
            schema={schema ?? null}
            record={
              (response.data ?? {}) as Record<string, unknown>
            }
          />
        </div>
      )}
    </div>
  )
}
