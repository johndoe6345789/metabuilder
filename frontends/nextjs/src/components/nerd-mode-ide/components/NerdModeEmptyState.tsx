import { DescriptionOutlined } from '@/fakemui/icons'

export function NerdModeEmptyState() {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center">
        <DescriptionOutlined size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
        <p>Select a file to edit</p>
      </div>
    </div>
  )
}
