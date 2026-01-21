import { PanelHeader } from '@/components/atoms'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { componentTreeConfig } from '@/components/molecules/component-tree/componentTreeConfig'
import { componentTreeIcons } from '@/components/molecules/component-tree/componentTreeIcons'
import { CaretDown, CaretRight } from '@phosphor-icons/react'

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
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <PanelHeader
          title={componentTreeConfig.title}
          subtitle={`${componentsCount} ${subtitleLabel}`}
          icon={<Icon size={20} weight="duotone" />}
        />
        {componentsCount > 0 && (
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExpandAll}
                  className="h-7 w-7 p-0"
                >
                  <CaretDown size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{componentTreeConfig.tooltips.expandAll}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCollapseAll}
                  className="h-7 w-7 p-0"
                >
                  <CaretRight size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{componentTreeConfig.tooltips.collapseAll}</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}
