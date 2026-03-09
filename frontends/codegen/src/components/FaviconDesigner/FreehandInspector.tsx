import { Input } from '@metabuilder/fakemui/inputs'
import { Label } from '@metabuilder/fakemui/atoms'
import { Slider } from '@metabuilder/fakemui/inputs'
import { Drop, Gradient, PencilSimple, Sparkle } from '@metabuilder/fakemui/icons'
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
      <select
        value={element.brushEffect || 'solid'}
        onChange={(event) => onUpdateElement({ brushEffect: event.target.value as BrushEffect })}
      >
        <option value="solid">
          <PencilSimple size={16} />
          {copy.effects.solid}
        </option>
        <option value="gradient">
          <Gradient size={16} />
          {copy.effects.gradient}
        </option>
        <option value="spray">
          <Drop size={16} />
          {copy.effects.spray}
        </option>
        <option value="glow">
          <Sparkle size={16} />
          {copy.effects.glow}
        </option>
      </select>
    </div>

    <div>
      <Label>{copy.inspector.strokeColor}</Label>
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

    {element.brushEffect === 'gradient' && (
      <div>
        <Label>{copy.brush.gradientColorLabel}</Label>
        <div>
          <Input
            type="color"
            value={element.gradientColor || copy.placeholders.gradient}
            onChange={(event) => onUpdateElement({ gradientColor: event.target.value })}
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
