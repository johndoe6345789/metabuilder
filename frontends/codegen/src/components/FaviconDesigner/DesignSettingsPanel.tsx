import { Input } from '@metabuilder/fakemui/inputs'
import { Label } from '@metabuilder/fakemui/atoms'
import { Slider } from '@metabuilder/fakemui/inputs'
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
  <div>
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
      <select value={activeDesignId} onChange={(e) => onSelectDesign(e.target.value)}>
        {designs.map((design) => (
          <option key={design.id} value={design.id}>
            {design.name}
          </option>
        ))}
      </select>
    </div>

    <div>
      <Label>{copy.design.sizeLabel}</Label>
      <select value={String(activeDesign.size)} onChange={(e) => onUpdateDesign({ size: Number(e.target.value) })}>
        {PRESET_SIZES.map((size) => (
          <option key={size} value={String(size)}>
            {size}x{size}
          </option>
        ))}
      </select>
    </div>

    <div>
      <Label>{copy.design.backgroundLabel}</Label>
      <div>
        <Input
          type="color"
          value={activeDesign.backgroundColor}
          onChange={(e) => onUpdateDesign({ backgroundColor: e.target.value })}
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
      <select
        value={activeDesign.filter || 'none'}
        onChange={(e) => onUpdateDesign({ filter: e.target.value as CanvasFilter })}
      >
        {(Object.keys(copy.filters) as Array<keyof typeof copy.filters>).map((key) => (
          <option key={key} value={key}>
            {copy.filters[key]}
          </option>
        ))}
      </select>
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
