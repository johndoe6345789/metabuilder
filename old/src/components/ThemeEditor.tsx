import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Palette, Sun, Moon, FloppyDisk, ArrowCounterClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface ThemeColors {
  background: string
  foreground: string
  card: string
  cardForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
}

interface ThemeConfig {
  light: ThemeColors
  dark: ThemeColors
  radius: string
}

const DEFAULT_LIGHT_THEME: ThemeColors = {
  background: 'oklch(0.92 0.03 290)',
  foreground: 'oklch(0.25 0.02 260)',
  card: 'oklch(1 0 0)',
  cardForeground: 'oklch(0.25 0.02 260)',
  primary: 'oklch(0.55 0.18 290)',
  primaryForeground: 'oklch(0.98 0 0)',
  secondary: 'oklch(0.35 0.02 260)',
  secondaryForeground: 'oklch(0.90 0.01 260)',
  muted: 'oklch(0.95 0.02 290)',
  mutedForeground: 'oklch(0.50 0.02 260)',
  accent: 'oklch(0.70 0.17 195)',
  accentForeground: 'oklch(0.2 0.02 260)',
  destructive: 'oklch(0.55 0.22 25)',
  destructiveForeground: 'oklch(0.98 0 0)',
  border: 'oklch(0.85 0.02 290)',
  input: 'oklch(0.85 0.02 290)',
  ring: 'oklch(0.70 0.17 195)',
}

const DEFAULT_DARK_THEME: ThemeColors = {
  background: 'oklch(0.145 0 0)',
  foreground: 'oklch(0.985 0 0)',
  card: 'oklch(0.205 0 0)',
  cardForeground: 'oklch(0.985 0 0)',
  primary: 'oklch(0.922 0 0)',
  primaryForeground: 'oklch(0.205 0 0)',
  secondary: 'oklch(0.269 0 0)',
  secondaryForeground: 'oklch(0.985 0 0)',
  muted: 'oklch(0.269 0 0)',
  mutedForeground: 'oklch(0.708 0 0)',
  accent: 'oklch(0.269 0 0)',
  accentForeground: 'oklch(0.985 0 0)',
  destructive: 'oklch(0.704 0.191 22.216)',
  destructiveForeground: 'oklch(0.98 0 0)',
  border: 'oklch(1 0 0 / 10%)',
  input: 'oklch(1 0 0 / 15%)',
  ring: 'oklch(0.556 0 0)',
}

export function ThemeEditor() {
  const [themeConfig, setThemeConfig] = useKV<ThemeConfig>('theme_config', {
    light: DEFAULT_LIGHT_THEME,
    dark: DEFAULT_DARK_THEME,
    radius: '0.5rem',
  })
  
  const [isDarkMode, setIsDarkMode] = useKV<boolean>('dark_mode_enabled', false)
  const [editingTheme, setEditingTheme] = useState<'light' | 'dark'>('light')
  const [localColors, setLocalColors] = useState<ThemeColors>(DEFAULT_LIGHT_THEME)
  const [localRadius, setLocalRadius] = useState('0.5rem')

  useEffect(() => {
    if (themeConfig) {
      setLocalColors(editingTheme === 'light' ? themeConfig.light : themeConfig.dark)
      setLocalRadius(themeConfig.radius)
    }
  }, [editingTheme, themeConfig])

  useEffect(() => {
    if (themeConfig) {
      applyTheme()
    }
  }, [themeConfig, isDarkMode])

  const applyTheme = () => {
    if (!themeConfig) return
    
    const root = document.documentElement
    const colors = isDarkMode ? themeConfig.dark : themeConfig.light
    
    Object.entries(colors).forEach(([key, value]) => {
      const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(`--${cssVarName}`, value)
    })
    
    root.style.setProperty('--radius', themeConfig.radius)
    
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setLocalColors((current) => ({
      ...current,
      [colorKey]: value,
    }))
  }

  const handleSave = () => {
    setThemeConfig((current) => {
      if (!current) return { light: localColors, dark: DEFAULT_DARK_THEME, radius: localRadius }
      return {
        ...current,
        [editingTheme]: localColors,
        radius: localRadius,
      }
    })
    toast.success('Theme saved successfully')
  }

  const handleReset = () => {
    const defaultTheme = editingTheme === 'light' ? DEFAULT_LIGHT_THEME : DEFAULT_DARK_THEME
    setLocalColors(defaultTheme)
    setLocalRadius('0.5rem')
    toast.info('Theme reset to defaults')
  }

  const handleToggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked)
    toast.success(checked ? 'Dark mode enabled' : 'Light mode enabled')
  }

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette size={24} />
                Theme Editor
              </CardTitle>
              <CardDescription>
                Customize the application theme colors and appearance
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Sun size={18} className={!isDarkMode ? 'text-amber-500' : 'text-muted-foreground'} />
              <Switch checked={isDarkMode} onCheckedChange={handleToggleDarkMode} />
              <Moon size={18} className={isDarkMode ? 'text-blue-400' : 'text-muted-foreground'} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={editingTheme} onValueChange={(v) => setEditingTheme(v as 'light' | 'dark')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="light">Light Theme</TabsTrigger>
              <TabsTrigger value="dark">Dark Theme</TabsTrigger>
            </TabsList>
            
            <TabsContent value={editingTheme} className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="radius">Border Radius</Label>
                  <Input
                    id="radius"
                    value={localRadius}
                    onChange={(e) => setLocalRadius(e.target.value)}
                    placeholder="e.g., 0.5rem"
                    className="mt-1.5"
                  />
                </div>
              </div>

              {colorGroups.map((group) => (
                <div key={group.title} className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.colors.map(({ key, label }) => (
                      <div key={key} className="space-y-1.5">
                        <Label htmlFor={key}>{label}</Label>
                        <div className="flex gap-2">
                          <div
                            className="w-10 h-10 rounded border border-border shrink-0"
                            style={{ background: localColors[key] }}
                          />
                          <Input
                            id={key}
                            value={localColors[key]}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            placeholder="oklch(...)"
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button onClick={handleSave} className="gap-2">
                  <FloppyDisk size={16} />
                  Save Theme
                </Button>
                <Button onClick={handleReset} variant="outline" className="gap-2">
                  <ArrowCounterClockwise size={16} />
                  Reset to Defaults
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 border border-border rounded-lg bg-muted/30">
            <h4 className="text-sm font-semibold mb-3">Theme Preview</h4>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button size="sm">Primary Button</Button>
                <Button size="sm" variant="secondary">Secondary</Button>
                <Button size="sm" variant="outline">Outline</Button>
                <Button size="sm" variant="destructive">Destructive</Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Card Example</CardTitle>
                  <CardDescription>This is a card description</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Card content with muted text</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
