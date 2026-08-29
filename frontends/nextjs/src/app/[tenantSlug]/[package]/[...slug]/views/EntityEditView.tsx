/** EntityEditView. */

import { EntityEditActions } from './EntityEditActions'
import { EntityLoadError } from './EntityLoadError'
import { EntityEditFields } from './EntityEditFields'
import { SOFT_RADIUS } from './radii'
import { fetchEntity } from '@/lib/entities/api-client'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

export async function EntityEditView({
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
    <div className="entity-edit">
      <h2 style={{ marginBottom: '1rem' }}>
        Edit {entity} #{id}
      </h2>

      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
        API: <code>PUT {apiUrl}</code>
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
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Form fields based on schema with current values:
          </p>
          <EntityEditFields
            schema={schema ?? null}
            record={
              (response.data ?? {}) as Record<string, unknown>
            }
          />
          <EntityEditActions
            tenant={tenant}
            pkg={pkg}
            entity={entity}
            id={id}
          />
        </div>
      )}
    </div>
  )
}
