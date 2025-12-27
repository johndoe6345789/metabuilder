import { Badge, Button, Card, Separator } from '@/components/ui'
import { Pencil, Trash } from '@phosphor-icons/react'
import type { DropdownConfig } from '@/lib/database'

interface PreviewPaneProps {
  dropdown: DropdownConfig
  onEdit: (dropdown: DropdownConfig) => void
  onDelete: (id: string) => void
}

export function PreviewPane({ dropdown, onEdit, onDelete }: PreviewPaneProps) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this dropdown configuration?')) {
      onDelete(dropdown.id)
    }
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{dropdown.label}</h3>
          <p className="text-xs text-muted-foreground font-mono">{dropdown.name}</p>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(dropdown)}>
            <Pencil size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDelete}>
            <Trash size={16} />
          </Button>
        </div>
      </div>
      <Separator />
      <div className="flex flex-wrap gap-1">
        {dropdown.options.map((opt, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {opt.label}
          </Badge>
        ))}
      </div>
    </Card>
  )
}
