import { PanelHeader } from '@/components/atoms'
import { Button } from '@metabuilder/fakemui/inputs'
import { Tooltip } from '@metabuilder/fakemui/data-display'
import { componentTreeConfig } from '@/components/molecules/component-tree/componentTreeConfig'
import { componentTreeIcons } from '@/components/molecules/component-tree/componentTreeIcons'
import { CaretDown, CaretRight } from '@metabuilder/fakemui/icons'

interface ComponentTreeHeaderProps {
  componentsCount: number
  onExpandAll: () => void
  onCollapseAll: () => void
}

export function ComponentTreeHeader({
  componentsCount,
  onExpandAll,
  onCollapseAll,
}: ComponentTreeHeaderProps) {
  const Icon = componentTreeIcons[componentTreeConfig.icon as keyof typeof componentTreeIcons]
  const subtitleLabel = componentsCount === 1
    ? componentTreeConfig.subtitle.singular
    : componentTreeConfig.subtitle.plural

  return (
    <div>
      <div>
        <PanelHeader
          title={componentTreeConfig.title}
          subtitle={`${componentsCount} ${subtitleLabel}`}
          icon={<Icon size={20} weight="duotone" />}
        />
        {componentsCount > 0 && (
          <div>
            <Tooltip title={componentTreeConfig.tooltips.expandAll}>
              <Button
                variant="text"
                size="small"
                onClick={onExpandAll}
              >
                <CaretDown size={16} />
              </Button>
            </Tooltip>
            <Tooltip title={componentTreeConfig.tooltips.collapseAll}>
              <Button
                variant="text"
                size="small"
                onClick={onCollapseAll}
              >
                <CaretRight size={16} />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}
