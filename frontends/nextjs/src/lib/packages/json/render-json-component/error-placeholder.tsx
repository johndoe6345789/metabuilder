import type { ReactNode } from 'react'

const SOFT_RADIUS = '1rem'

export type PlaceholderTone = 'error' | 'warning' | 'ref-warning'

/** The three inline-diagnostic styles a broken/incomplete JSON component
 *  definition can render as, kept in one table so a new one is a row,
 *  not a fourth copy of the same styled <div>. */
const TONE_STYLES: Record<PlaceholderTone, React.CSSProperties> = {
  error: { padding: '1rem', border: '1px solid red', borderRadius: SOFT_RADIUS },
  warning: {
    padding: '1rem',
    border: '1px solid yellow',
    borderRadius: SOFT_RADIUS,
  },
  'ref-warning': {
    padding: '0.5rem',
    border: '1px dashed orange',
    borderRadius: SOFT_RADIUS,
  },
}

export function Placeholder({
  tone,
  children,
}: {
  tone: PlaceholderTone
  children: ReactNode
}) {
  return <div style={TONE_STYLES[tone]}>{children}</div>
}
