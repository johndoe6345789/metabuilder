import { Input, Label } from '@/components/ui'
import { ThemeColors } from './types'

const colorGroups = [
  {
    title: 'Base Colors',
    colors: [
      { key: 'background' as const, label: 'Background' },
      { key: 'foreground' as const, label: 'Foreground' },
      { key: 'card' as const, label: 'Card' },
      { key: 'cardForeground' as const, label: 'Card Foreground' },
    ],
  },
  {
    title: 'Action Colors',
    colors: [
      { key: 'primary' as const, label: 'Primary' },
      { key: 'primaryForeground' as const, label: 'Primary Foreground' },
      { key: 'secondary' as const, label: 'Secondary' },
      { key: 'secondaryForeground' as const, label: 'Secondary Foreground' },
      { key: 'accent' as const, label: 'Accent' },
      { key: 'accentForeground' as const, label: 'Accent Foreground' },
      { key: 'destructive' as const, label: 'Destructive' },
      { key: 'destructiveForeground' as const, label: 'Destructive Foreground' },
    ],
  },
  {
    title: 'Supporting Colors',
    colors: [
      { key: 'muted' as const, label: 'Muted' },
      { key: 'mutedForeground' as const, label: 'Muted Foreground' },
      { key: 'border' as const, label: 'Border' },
      { key: 'input' as const, label: 'Input' },
      { key: 'ring' as const, label: 'Ring' },
    ],
  },
]

interface PaletteEditorProps {
  colors: ThemeColors
  radius: string
  onColorChange: (colorKey: keyof ThemeColors, value: string) => void
  onRadiusChange: (value: string) => void
}

export function PaletteEditor({
  colors,
  radius,
  onColorChange,
  onRadiusChange,
}: PaletteEditorProps) {
  return (
    <div className="space-y-6 mt-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="radius">Border Radius</Label>
          <Input
            id="radius"
            value={radius}
            onChange={e => onRadiusChange(e.target.value)}
            placeholder="e.g., 0.5rem"
            className="mt-1.5"
          />
        </div>
      </div>

      {colorGroups.map(group => (
        <div key={group.title} className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.colors.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key}>{label}</Label>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded border border-border shrink-0"
                    style={{ background: colors[key] }}
                  />
                  <Input
                    id={key}
                    value={colors[key]}
                    onChange={e => onColorChange(key, e.target.value)}
                    placeholder="oklch(...)"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
