/** EntityCreateView. */

import { SOFT_RADIUS } from './radii'
import { EntityForm } from './EntityForm'
import { formFields } from './entity-form-fields'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

export function EntityCreateView({
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

  return (
    <div className="entity-create">
      <h2 style={{ marginBottom: '1rem' }}>Create {entity}</h2>

      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
        API: <code>POST {apiUrl}</code>
      </p>

      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: SOFT_RADIUS,
          padding: '1.5rem',
        }}
      >
        <EntityForm
          fields={formFields(schema ?? null, {})}
          record={{}}
          target={{ tenant, pkg, entity }}
          submitLabel={`Create ${entity}`}
        />
      </div>
    </div>
  )
}
