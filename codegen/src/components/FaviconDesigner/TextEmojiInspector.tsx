import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
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
      <Label>{formatCopy(copy.inspector.fontSize, { value: element.fontSize })}</Label>
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
        <Select value={element.fontWeight || 'bold'} onValueChange={(value) => onUpdateElement({ fontWeight: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">{copy.fontWeights.normal}</SelectItem>
            <SelectItem value="bold">{copy.fontWeights.bold}</SelectItem>
            <SelectItem value="lighter">{copy.fontWeights.lighter}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )}
  </>
)
