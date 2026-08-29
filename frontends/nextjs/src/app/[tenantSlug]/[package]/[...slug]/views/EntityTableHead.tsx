/** The header row, one column per schema field plus actions. */

import type { EntitySchema } from '@/lib/entities/load-entity-schema'

export function EntityTableHead({
  schema,
}: {
  schema: EntitySchema | null
}) {
  return (
      <thead style={{ backgroundColor: '#f5f5f5' }}>
        <tr>
          {schema?.fields.map(field => (
            <th
              key={field.name}
              style={{
                padding: '0.75rem',
                textAlign: 'left',
                borderBottom: '2px solid #e0e0e0',
              }}
            >
              {field.name}
            </th>
          ))}
          <th
            style={{
              padding: '0.75rem',
              textAlign: 'left',
              borderBottom: '2px solid #e0e0e0',
            }}
          >
            Actions
          </th>
        </tr>
      </thead>
  )
}
