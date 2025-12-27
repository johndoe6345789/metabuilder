import { ComponentConfigDialog } from '../ComponentConfigDialog'
import type { ComponentNode } from '@/lib/database'

type ConfigDialogLauncherProps = {
  configNodeId: string | null
  hierarchy: Record<string, ComponentNode>
  nerdMode: boolean
  onClose: () => void
  onSaved: () => Promise<void>
}

export function ConfigDialogLauncher({
  configNodeId,
  hierarchy,
  nerdMode,
  onClose,
  onSaved,
}: ConfigDialogLauncherProps) {
  if (!configNodeId || !hierarchy[configNodeId]) return null

  return (
    <ComponentConfigDialog
      node={hierarchy[configNodeId]}
      isOpen={!!configNodeId}
      onClose={onClose}
      onSave={async () => {
        await onSaved()
        onClose()
      }}
      nerdMode={nerdMode}
    />
  )
}
