import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import copy from '@/data/favicon-designer.json'
import { formatCopy } from './formatCopy'
import { FaviconDesign, FaviconElement } from './types'

type ShapeInspectorProps = {
  element: FaviconElement
  activeDesign: FaviconDesign
  onUpdateElement: (updates: Partial<FaviconElement>) => void
}

export const ShapeInspector = ({ element, activeDesign, onUpdateElement }: ShapeInspectorProps) => (
  <>
    <div>
      <Label>{formatCopy(copy.inspector.width, { value: element.width })}</Label>
      <Slider
        value={[element.width]}
        onValueChange={([value]) => onUpdateElement({ width: value })}
        min={10}
        max={activeDesign.size}
        step={1}
      />
    </div>
    <div>
      <Label>{formatCopy(copy.inspector.height, { value: element.height })}</Label>
      <Slider
        value={[element.height]}
        onValueChange={([value]) => onUpdateElement({ height: value })}
        min={10}
        max={activeDesign.size}
        step={1}
      />
    </div>
  </>
)
