import { Input } from '@metabuilder/m3/inputs'
import { Label } from '@metabuilder/m3/atoms'
import copy from '@/data/favicon-designer.json'
import { FaviconElement } from './types'

type ColorInspectorProps = {
  element: FaviconElement
  onUpdateElement: (updates: Partial<FaviconElement>) => void
}

export const ColorInspector = ({ element, onUpdateElement }: ColorInspectorProps) => (
  <div>
    <Label>{copy.inspector.color}</Label>
    <div>
      <Input
        type="color"
        value={element.color}
        onChange={(event) => onUpdateElement({ color: event.target.value })}
      />
      <Input
        value={element.color}
        onChange={(event) => onUpdateElement({ color: event.target.value })}
        placeholder={copy.placeholders.color}
      />
    </div>
  </div>
)
