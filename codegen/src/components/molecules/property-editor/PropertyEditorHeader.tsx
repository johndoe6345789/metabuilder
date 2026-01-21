import { Badge, IconButton, PanelHeader, Stack, Text } from '@/components/atoms'
import { propertyEditorConfig } from '@/components/molecules/property-editor/propertyEditorConfig'
import { propertyEditorIcons } from '@/components/molecules/property-editor/propertyEditorIcons'
import { Trash } from '@phosphor-icons/react'

interface PropertyEditorHeaderProps {
  componentId: string
  componentLabel: string
  onDelete: () => void
}

export function PropertyEditorHeader({ componentId, componentLabel, onDelete }: PropertyEditorHeaderProps) {
  const Icon = propertyEditorIcons[propertyEditorConfig.icon as keyof typeof propertyEditorIcons]

  return (
    <div className="p-4">
      <PanelHeader
        title={propertyEditorConfig.title}
        subtitle={
          <Stack direction="horizontal" align="center" spacing="sm" className="mt-1">
            <Badge variant="outline" className="text-xs font-mono">
              {componentLabel}
            </Badge>
            <Text variant="caption">#{componentId}</Text>
          </Stack>
        }
        icon={<Icon size={20} weight="duotone" />}
        actions={
          <IconButton
            icon={<Trash className="w-4 h-4" />}
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          />
        }
      />
    </div>
  )
}
