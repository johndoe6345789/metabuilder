import { Input } from '@metabuilder/fakemui/inputs'
import { Label } from '@metabuilder/fakemui/atoms'
import { Slider } from '@metabuilder/fakemui/inputs'
import { Drop, Gradient, PencilSimple, Sparkle } from '@metabuilder/fakemui/icons'
import copy from '@/data/favicon-designer.json'
import { formatCopy } from './formatCopy'
import { BrushEffect } from './types'

type BrushSettingsPanelProps = {
  drawMode: 'draw' | 'erase'
  brushEffect: BrushEffect
  brushColor: string
  brushSize: number
  gradientColor: string
  glowIntensity: number
  onBrushEffectChange: (value: BrushEffect) => void
  onBrushColorChange: (value: string) => void
  onBrushSizeChange: (value: number) => void
  onGradientColorChange: (value: string) => void
  onGlowIntensityChange: (value: number) => void
}

export const BrushSettingsPanel = ({
  drawMode,
  brushEffect,
  brushColor,
  brushSize,
  gradientColor,
  glowIntensity,
  onBrushEffectChange,
  onBrushColorChange,
  onBrushSizeChange,
  onGradientColorChange,
  onGlowIntensityChange,
}: BrushSettingsPanelProps) => (
  <div>
    <Label>
      {drawMode === 'draw' ? copy.brush.settingsTitle : copy.brush.eraserSettingsTitle}
    </Label>

    {drawMode === 'draw' && (
      <>
        <div>
          <Label>{copy.brush.effectLabel}</Label>
          <select value={brushEffect} onChange={(e) => onBrushEffectChange(e.target.value as BrushEffect)}>
            <option value="solid">
              {copy.effects.solid}
            </option>
            <option value="gradient">
              {copy.effects.gradient}
            </option>
            <option value="spray">
              {copy.effects.spray}
            </option>
            <option value="glow">
              {copy.effects.glow}
            </option>
          </select>
        </div>

        <div>
          <Label>{copy.brush.colorLabel}</Label>
          <div>
            <Input
              type="color"
              value={brushColor}
              onChange={(event) => onBrushColorChange(event.target.value)}
            />
            <Input
              value={brushColor}
              onChange={(event) => onBrushColorChange(event.target.value)}
              placeholder={copy.placeholders.color}
            />
          </div>
        </div>

        {brushEffect === 'gradient' && (
          <div>
            <Label>{copy.brush.gradientColorLabel}</Label>
            <div>
              <Input
                type="color"
                value={gradientColor}
                onChange={(event) => onGradientColorChange(event.target.value)}
              />
              <Input
                value={gradientColor}
                onChange={(event) => onGradientColorChange(event.target.value)}
                placeholder={copy.placeholders.gradient}
              />
            </div>
          </div>
        )}

        {brushEffect === 'glow' && (
          <div>
            <Label>{formatCopy(copy.brush.glowIntensity, { value: glowIntensity })}</Label>
            <Slider
              value={[glowIntensity]}
              onValueChange={([value]) => onGlowIntensityChange(value)}
              min={1}
              max={30}
              step={1}
            />
          </div>
        )}
      </>
    )}

    <div>
      <Label>
        {formatCopy(copy.brush.sizeLabel, {
          mode: drawMode === 'draw' ? copy.modes.draw : copy.modes.erase,
          size: brushSize,
        })}
      </Label>
      <Slider value={[brushSize]} onValueChange={([value]) => onBrushSizeChange(value)} min={1} max={20} step={1} />
    </div>
  </div>
)
