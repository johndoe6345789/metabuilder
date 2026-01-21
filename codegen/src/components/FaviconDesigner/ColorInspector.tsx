import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import copy from '@/data/favicon-designer.json'
import { FaviconElement } from './types'

type ColorInspectorProps = {
  element: FaviconElement
  onUpdateElement: (updates: Partial<FaviconElement>) => void
}

export const ColorInspector = ({ element, onUpdateElement }: ColorInspectorProps) => (
  <div>
    <Label>{copy.inspector.color}</Label>
    <div className="flex gap-2">
      <Input
        type="color"
        value={element.color}
        onChange={(event) => onUpdateElement({ color: event.target.value })}
        className="w-20 h-10"
      />
      <Input
        value={element.color}
        onChange={(event) => onUpdateElement({ color: event.target.value })}
        placeholder={copy.placeholders.color}
      />
    </div>
  </div>
)
