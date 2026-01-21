import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import copy from '@/data/favicon-designer.json'
import { PRESET_SIZES } from './constants'
import { formatCopy } from './formatCopy'
import { CanvasFilter, FaviconDesign } from './types'

type DesignSettingsPanelProps = {
  activeDesign: FaviconDesign
  activeDesignId: string
  designs: FaviconDesign[]
  onUpdateDesign: (updates: Partial<FaviconDesign>) => void
  onSelectDesign: (value: string) => void
}

export const DesignSettingsPanel = ({
  activeDesign,
  activeDesignId,
  designs,
  onUpdateDesign,
  onSelectDesign,
}: DesignSettingsPanelProps) => (
  <div className="space-y-6">
    <div>
      <Label>{copy.design.nameLabel}</Label>
      <Input
        value={activeDesign.name}
        onChange={(e) => onUpdateDesign({ name: e.target.value })}
        placeholder={copy.design.namePlaceholder}
      />
    </div>

    <div>
      <Label>{copy.design.selectLabel}</Label>
      <Select value={activeDesignId} onValueChange={onSelectDesign}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {designs.map((design) => (
            <SelectItem key={design.id} value={design.id}>
              {design.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label>{copy.design.sizeLabel}</Label>
      <Select value={String(activeDesign.size)} onValueChange={(value) => onUpdateDesign({ size: Number(value) })}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESET_SIZES.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}x{size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label>{copy.design.backgroundLabel}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={activeDesign.backgroundColor}
          onChange={(e) => onUpdateDesign({ backgroundColor: e.target.value })}
          className="w-20 h-10"
        />
        <Input
          value={activeDesign.backgroundColor}
          onChange={(e) => onUpdateDesign({ backgroundColor: e.target.value })}
          placeholder={copy.design.backgroundPlaceholder}
        />
      </div>
    </div>

    <div>
      <Label>{copy.design.filterLabel}</Label>
      <Select
        value={activeDesign.filter || 'none'}
        onValueChange={(value) => onUpdateDesign({ filter: value as CanvasFilter })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(copy.filters) as Array<keyof typeof copy.filters>).map((key) => (
            <SelectItem key={key} value={key}>
              {copy.filters[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {activeDesign.filter && activeDesign.filter !== 'none' && (
      <div>
        <Label>{formatCopy(copy.design.filterIntensity, { value: activeDesign.filterIntensity || 50 })}</Label>
        <Slider
          value={[activeDesign.filterIntensity || 50]}
          onValueChange={([value]) => onUpdateDesign({ filterIntensity: value })}
          min={0}
          max={100}
          step={1}
        />
      </div>
    )}
  </div>
)
