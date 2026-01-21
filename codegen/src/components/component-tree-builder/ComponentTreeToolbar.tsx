import { Button } from '@/components/ui/button'
import { Plus, Sparkle } from '@phosphor-icons/react'

interface ComponentTreeToolbarProps {
  onGenerate: () => void
  onAddRoot: () => void
}

export function ComponentTreeToolbar({
  onGenerate,
  onAddRoot,
}: ComponentTreeToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-sm uppercase tracking-wide">
        Component Tree
      </h3>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={onGenerate}
          className="h-8 w-8 p-0"
          title="Generate component with AI"
        >
          <Sparkle size={16} weight="duotone" />
        </Button>
        <Button size="sm" onClick={onAddRoot} className="h-8 w-8 p-0">
          <Plus size={16} />
        </Button>
      </div>
    </div>
  )
}
