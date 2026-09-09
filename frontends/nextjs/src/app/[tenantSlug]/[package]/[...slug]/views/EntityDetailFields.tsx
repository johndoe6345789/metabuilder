/** One record's field values, read-only. */

import type { EntitySchema } from '@/lib/entities/load-entity-schema'
import { cellText, columnsFor } from './entity-columns'

export function EntityDetailFields({
  schema,
  record,
}: {
  schema: EntitySchema | null
  record: Record<string, unknown>
}) {
  // Without a package schema this showed nothing at all; the record
  // says what it carries. See entity-columns.ts.
  const columns = columnsFor(schema, [record])
  return (
    <>
      {columns.map(name => (
        <div key={name} style={{ marginBottom: '1rem' }}>
          <strong
            style={{
              display: 'block',
              marginBottom: '0.25rem',
              color: '#424242',
            }}
          >
            {name}:
          </strong>
          <div style={{ color: '#616161' }}>{cellText(record[name])}</div>
        </div>
      ))}
    </>
  )
}
