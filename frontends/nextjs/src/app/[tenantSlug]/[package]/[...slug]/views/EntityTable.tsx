/** The rows and columns of a list view, derived from the schema. */

import { EntityTableHead } from './EntityTableHead'
import type { EntitySchema } from '@/lib/entities/load-entity-schema'

export function EntityTable({
  schema,
  rows,
  tenant,
  pkg,
  entity,
}: {
  schema: EntitySchema | null
  rows: Record<string, unknown>[]
  tenant: string
  pkg: string
  entity: string
}) {
  return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <EntityTableHead schema={schema} />
        <tbody>
          {rows.length > 0 ? (
            rows.map(
              (item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  {schema?.fields.map(field => (
                    <td key={field.name} style={{ padding: '0.75rem' }}>
                      {(() => {
                        const value = item[field.name]
                        if (value === null || value === undefined)
                          return '-'
                        if (typeof value === 'object')
                          return JSON.stringify(value)
                        // eslint-disable-next-line @typescript-eslint/no-base-to-string
                        return String(value)
                      })()}
                    </td>
                  ))}
                  <td style={{ padding: '0.75rem' }}>
                    <a
                      href={`/${tenant}/${pkg}/${entity}/${String(item[schema?.primaryKey ?? 'id'])}`}
                      style={{ color: '#1976d2', textDecoration: 'none' }}
                    >
                      View
                    </a>
                  </td>
                </tr>
              )
            )
          ) : (
            <tr>
              <td
                colSpan={(schema?.fields.length ?? 0) + 1}
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#666',
                }}
              >
                No {entity} found. Create one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
  )
}
