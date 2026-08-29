/** One record's field values, read-only. */

import type { EntitySchema } from '@/lib/entities/load-entity-schema'

export function EntityDetailFields({
  schema,
  record,
}: {
  schema: EntitySchema | null
  record: Record<string, unknown>
}) {
  return (
    <>
      {schema?.fields.map(field => (
        <div key={field.name} style={{ marginBottom: '1rem' }}>
          <strong
            style={{
              display: 'block',
              marginBottom: '0.25rem',
              color: '#424242',
            }}
          >
            {field.name}:
          </strong>
          <div style={{ color: '#616161' }}>
            {(() => {
              const value = record[
                field.name
              ]
              if (value === null || value === undefined) return '-'
              if (typeof value === 'object') return JSON.stringify(value)
              // eslint-disable-next-line @typescript-eslint/no-base-to-string
              return String(value)
            })()}
          </div>
        </div>
      ))}
    </>
  )
}
