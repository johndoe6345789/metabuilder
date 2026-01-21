import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Drop, Gradient, PencilSimple, Sparkle } from '@phosphor-icons/react'
import copy from '@/data/favicon-designer.json'
import { formatCopy } from './formatCopy'
import { BrushEffect, FaviconElement } from './types'

type FreehandInspectorProps = {
  element: FaviconElement
  onUpdateElement: (updates: Partial<FaviconElement>) => void
}

export const FreehandInspector = ({ element, onUpdateElement }: FreehandInspectorProps) => (
  <>
    <div>
      <Label>{copy.brush.effectLabel}</Label>
      <Select
        value={element.brushEffect || 'solid'}
        onValueChange={(value) => onUpdateElement({ brushEffect: value as BrushEffect })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="solid">
            <div className="flex items-center gap-2">
              <PencilSimple size={16} />
              {copy.effects.solid}
            </div>
          </SelectItem>
          <SelectItem value="gradient">
            <div className="flex items-center gap-2">
              <Gradient size={16} />
              {copy.effects.gradient}
            </div>
          </SelectItem>
          <SelectItem value="spray">
            <div className="flex items-center gap-2">
              <Drop size={16} />
              {copy.effects.spray}
            </div>
          </SelectItem>
          <SelectItem value="glow">
            <div className="flex items-center gap-2">
              <Sparkle size={16} />
              {copy.effects.glow}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label>{copy.inspector.strokeColor}</Label>
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

    {element.brushEffect === 'gradient' && (
      <div>
        <Label>{copy.brush.gradientColorLabel}</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={element.gradientColor || copy.placeholders.gradient}
            onChange={(event) => onUpdateElement({ gradientColor: event.target.value })}
            className="w-20 h-10"
          />
          <Input
            value={element.gradientColor || copy.placeholders.gradient}
            onChange={(event) => onUpdateElement({ gradientColor: event.target.value })}
            placeholder={copy.placeholders.gradient}
          />
        </div>
      </div>
    )}

    {element.brushEffect === 'glow' && (
      <div>
        <Label>{formatCopy(copy.brush.glowIntensity, { value: element.glowIntensity || 10 })}</Label>
        <Slider
          value={[element.glowIntensity || 10]}
          onValueChange={([value]) => onUpdateElement({ glowIntensity: value })}
          min={1}
          max={30}
          step={1}
        />
      </div>
    )}

    <div>
      <Label>{formatCopy(copy.inspector.strokeWidth, { value: element.strokeWidth || 3 })}</Label>
      <Slider
        value={[element.strokeWidth || 3]}
        onValueChange={([value]) => onUpdateElement({ strokeWidth: value })}
        min={1}
        max={20}
        step={1}
      />
    </div>
  </>
)
