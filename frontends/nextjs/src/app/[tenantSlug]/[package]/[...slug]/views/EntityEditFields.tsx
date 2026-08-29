/** The editable field inputs for one record. */

import type { EntitySchema } from '@/lib/entities/load-entity-schema'
import { SOFT_RADIUS } from './radii'

export function EntityEditFields({
  schema,
  record,
}: {
  schema: EntitySchema | null
  record: Record<string, unknown>
}) {
  return (
    <>
      {schema?.fields.map(field => {
        const value = record[field.name]
        return (
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
              defaultValue={(() => {
                if (value === null || value === undefined) return ''
                if (typeof value === 'object') return JSON.stringify(value)
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                return String(value)
              })()}
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              placeholder={
                field.description !== null &&
                field.description !== undefined &&
                field.description.length > 0
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
        )
      })}
    </>
  )
}
