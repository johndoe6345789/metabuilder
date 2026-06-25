import { Button, IconButton } from '@metabuilder/m3/inputs'
import { Plus, Sparkle } from '@metabuilder/m3/icons'

interface ComponentTreeToolbarProps {
  onGenerate: () => void
  onAddRoot: () => void
}

export function ComponentTreeToolbar({
  onGenerate,
  onAddRoot,
}: ComponentTreeToolbarProps) {
  return (
    <div>
      <h3>
        Component Tree
      </h3>
      <div>
        <IconButton
          onClick={onGenerate}
          title="Generate component with AI"
        >
          <Sparkle size={16} weight="duotone" />
        </IconButton>
        <IconButton onClick={onAddRoot}>
          <Plus size={16} />
        </IconButton>
      </div>
    </div>
  )
}
