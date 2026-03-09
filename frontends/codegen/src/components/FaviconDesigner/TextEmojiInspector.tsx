import { Input } from '@metabuilder/fakemui/inputs'
import { Label } from '@metabuilder/fakemui/atoms'
import { Slider } from '@metabuilder/fakemui/inputs'
import copy from '@/data/favicon-designer.json'
import { formatCopy } from './formatCopy'
import { FaviconElement } from './types'

type TextEmojiInspectorProps = {
  element: FaviconElement
  onUpdateElement: (updates: Partial<FaviconElement>) => void
}

export const TextEmojiInspector = ({ element, onUpdateElement }: TextEmojiInspectorProps) => (
  <>
    {element.type === 'text' && (
      <div>
        <Label>{copy.inspector.textLabel}</Label>
        <Input
          value={element.text || ''}
          onChange={(event) => onUpdateElement({ text: event.target.value })}
          placeholder={copy.inspector.textPlaceholder}
        />
      </div>
    )}

    {element.type === 'emoji' && (
      <div>
        <Label>{copy.inspector.emojiLabel}</Label>
        <Input
          value={element.emoji || ''}
          onChange={(event) => onUpdateElement({ emoji: event.target.value })}
          placeholder={copy.inspector.emojiPlaceholder}
        />
      </div>
    )}

    <div>
      <Label>{formatCopy(copy.inspector.fontSize, { value: element.fontSize ?? 32 })}</Label>
      <Slider
        value={[element.fontSize || 32]}
        onValueChange={([value]) => onUpdateElement({ fontSize: value })}
        min={12}
        max={200}
        step={1}
      />
    </div>

    {element.type === 'text' && (
      <div>
        <Label>{copy.inspector.fontWeight}</Label>
        <select
          value={element.fontWeight || 'bold'}
          onChange={(event) => onUpdateElement({ fontWeight: event.target.value })}
        >
          <option value="normal">{copy.fontWeights.normal}</option>
          <option value="bold">{copy.fontWeights.bold}</option>
          <option value="lighter">{copy.fontWeights.lighter}</option>
        </select>
      </div>
    )}
  </>
)
