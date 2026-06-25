import { Button } from '@metabuilder/m3/inputs'
import { Badge } from '@metabuilder/m3/data-display'
import {
  ArrowsClockwise,
  CheckCircle,
  TreeStructure,
} from '@metabuilder/m3/icons'
import componentTreeCopy from '@/data/component-tree-viewer.json'

export function ComponentTreeHeader({
  isLoaded,
  isLoading,
  totalTrees,
  onReload,
}: {
  isLoaded: boolean
  isLoading: boolean
  totalTrees: number
  onReload: () => void
}) {
  return (
    <div>
      <div>
        <TreeStructure
          size={24}
          weight="duotone"
        />
        <div>
          <h2>
            {componentTreeCopy.header.title}
          </h2>
          <p>
            {componentTreeCopy.header.subtitle}
          </p>
        </div>
      </div>
      <div>
        {isLoaded && (
          <Badge variant="outline">
            <CheckCircle
              size={14}
              weight="fill"
            />
            {totalTrees}{' '}
            {componentTreeCopy.header.loadedLabel}
          </Badge>
        )}
        <Button
          variant="outlined"
          size="small"
          onClick={onReload}
          disabled={isLoading}
        >
          <ArrowsClockwise size={16} />
          {componentTreeCopy.header.reloadLabel}
        </Button>
      </div>
    </div>
  )
}
