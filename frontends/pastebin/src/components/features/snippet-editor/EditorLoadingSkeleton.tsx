import type { CSSProperties } from 'react'
import { Skeleton } from '@metabuilder/components/fakemui'

/** Visually-hidden style for the screen-reader status region. */
export const srOnly: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
}

export function EditorLoadingSkeleton({
  height = '400px',
}: {
  height?: string
}) {
  return (
    <div
      style={{ height, display: 'flex', flexDirection: 'column', gap: 8 }}
      data-testid="monaco-editor-skeleton"
      role="status"
      aria-busy="true"
    >
      <Skeleton style={{ flex: 1, width: '100%', borderRadius: 6 }} />
    </div>
  )
}
