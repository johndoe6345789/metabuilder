import { ArrowsClockwise, Export, Trash, UploadSimple } from '@phosphor-icons/react'

import { Button } from '@/components/ui'

interface ActionToolbarProps {
  isLoading?: boolean
  onRefresh: () => void
  onExport: () => void
  onImport: () => void
  onClear: () => void
}

export function ActionToolbar({
  isLoading,
  onRefresh,
  onExport,
  onImport,
  onClear,
}: ActionToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Database Management</h2>
        <p className="text-muted-foreground">Manage all persistent data across the application</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <ArrowsClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Export size={16} className="mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={onImport}>
          <UploadSimple size={16} className="mr-2" />
          Import
        </Button>
        <Button variant="destructive" size="sm" onClick={onClear}>
          <Trash className="mr-2" size={16} />
          Clear DB
        </Button>
      </div>
    </div>
  )
}
