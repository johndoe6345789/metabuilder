/** EntityCreateView. */

import { SOFT_RADIUS, SOFT_PILL_RADIUS } from './radii'
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

      {/* TODO: Implement form with RenderComponent or form library */}
      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: SOFT_RADIUS,
          padding: '1.5rem',
        }}
      >
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Form fields based on schema:
        </p>
        {schema?.fields.map(field => (
          <div key={field.name} style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontWeight: '500',
              }}
            >
              {field.name}
              {field.required === true && (
                <span style={{ color: '#d32f2f' }}>*</span>
              )}
            </label>
            <input
              type="text"
              placeholder={
                field.description !== undefined && field.description.length > 0
                  ? field.description
                  : `Enter ${field.name}`
              }
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e0e0e0',
                borderRadius: SOFT_RADIUS,
              }}
            />
          </div>
        ))}
        <button
          type="button"
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: SOFT_PILL_RADIUS,
            cursor: 'pointer',
          }}
        >
          Create {entity}
        </button>
      </div>
    </div>
  )
}
