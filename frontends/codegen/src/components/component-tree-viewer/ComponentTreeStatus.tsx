import { Warning } from '@metabuilder/m3/icons'
import componentTreeCopy from '@/data/component-tree-viewer.json'

export function ComponentTreeStatus({
  error,
}: {
  error: Error | null
}) {
  if (!error) return null
  return (
    <div>
      <Warning size={20} weight="fill" />
      <div>
        <p>
          {componentTreeCopy.status.errorTitle}
        </p>
        <p>{error.message}</p>
      </div>
    </div>
  )
}
