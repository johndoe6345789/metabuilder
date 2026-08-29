/** Save and cancel for the edit form. */

import { SOFT_PILL_RADIUS } from './radii'

export function EntityEditActions({
  tenant,
  pkg,
  entity,
  id,
}: {
  tenant: string
  pkg: string
  entity: string
  id: string
}) {
  return (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
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
          Save Changes
        </button>
        <a
          href={`/${tenant}/${pkg}/${entity}/${id}`}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: '#f5f5f5',
            color: '#424242',
            textDecoration: 'none',
            border: '1px solid #e0e0e0',
            borderRadius: SOFT_PILL_RADIUS,
            display: 'inline-block',
          }}
        >
          Cancel
        </a>
      </div>
  )
}
