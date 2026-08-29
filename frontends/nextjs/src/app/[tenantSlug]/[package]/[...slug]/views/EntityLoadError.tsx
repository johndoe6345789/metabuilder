/**
 * The panel shown when an entity fetch fails.
 *
 * The detail and edit views carried identical copies of this, down to the
 * hex codes -- so a change to one silently diverged from the other.
 */

import { SOFT_RADIUS } from './radii'

export function EntityLoadError({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: '#ffebee',
        borderRadius: SOFT_RADIUS,
        color: '#c62828',
      }}
    >
      Error loading data: {message}
    </div>
  )
}
