import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Drop, Gradient, PencilSimple, Sparkle } from '@phosphor-icons/react'
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
  <div className="space-y-4">
    <Label className="text-base font-semibold">
      {drawMode === 'draw' ? copy.brush.settingsTitle : copy.brush.eraserSettingsTitle}
    </Label>

    {drawMode === 'draw' && (
      <>
        <div>
          <Label>{copy.brush.effectLabel}</Label>
          <Select value={brushEffect} onValueChange={(value) => onBrushEffectChange(value as BrushEffect)}>
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
          <Label>{copy.brush.colorLabel}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={brushColor}
              onChange={(event) => onBrushColorChange(event.target.value)}
              className="w-20 h-10"
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
            <div className="flex gap-2">
              <Input
                type="color"
                value={gradientColor}
                onChange={(event) => onGradientColorChange(event.target.value)}
                className="w-20 h-10"
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
