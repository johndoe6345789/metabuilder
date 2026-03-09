import { EmptyStateIcon, Stack, Text } from '@/components/atoms'
import { propertyEditorConfig } from '@/components/molecules/property-editor/propertyEditorConfig'
import { propertyEditorIcons } from '@/components/molecules/property-editor/propertyEditorIcons'

export function PropertyEditorEmptyState() {
  const Icon = propertyEditorIcons[propertyEditorConfig.icon as keyof typeof propertyEditorIcons]

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <Stack direction="vertical" align="center" spacing="md">
        <EmptyStateIcon icon={<Icon className="w-12 h-12" />} />
        <Stack direction="vertical" align="center" spacing="xs">
          <Text variant="small">{propertyEditorConfig.emptyState.title}</Text>
          <Text variant="caption">{propertyEditorConfig.emptyState.description}</Text>
        </Stack>
      </Stack>
    </div>
  )
}
