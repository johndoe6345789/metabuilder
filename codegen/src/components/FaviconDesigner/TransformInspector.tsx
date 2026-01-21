import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import copy from '@/data/favicon-designer.json'
import { formatCopy } from './formatCopy'
import { FaviconDesign, FaviconElement } from './types'

type TransformInspectorProps = {
  element: FaviconElement
  activeDesign: FaviconDesign
  onUpdateElement: (updates: Partial<FaviconElement>) => void
}

export const TransformInspector = ({ element, activeDesign, onUpdateElement }: TransformInspectorProps) => (
  <>
    <div>
      <Label>{formatCopy(copy.inspector.xPosition, { value: element.x })}</Label>
      <Slider
        value={[element.x]}
        onValueChange={([value]) => onUpdateElement({ x: value })}
        min={0}
        max={activeDesign.size}
        step={1}
      />
    </div>
    <div>
      <Label>{formatCopy(copy.inspector.yPosition, { value: element.y })}</Label>
      <Slider
        value={[element.y]}
        onValueChange={([value]) => onUpdateElement({ y: value })}
        min={0}
        max={activeDesign.size}
        step={1}
      />
    </div>
    <div>
      <Label>{formatCopy(copy.inspector.rotation, { value: element.rotation })}</Label>
      <Slider
        value={[element.rotation]}
        onValueChange={([value]) => onUpdateElement({ rotation: value })}
        min={0}
        max={360}
        step={1}
      />
    </div>
  </>
)
