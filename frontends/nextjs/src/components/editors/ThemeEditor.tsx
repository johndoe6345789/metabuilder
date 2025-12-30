import { useKV } from '@github/spark/hooks'
import { ArrowCounterClockwise, FloppyDisk, Moon, Palette, Sun } from '@/fakemui/icons'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Switch } from '@/components/ui'

import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME } from './theme/constants'
import { PaletteEditor } from './theme/PaletteEditor'
import { PreviewPane } from './theme/PreviewPane'
import { ThemeColors, ThemeConfig } from './theme/types'

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
    if (!themeConfig) return

    const root = document.documentElement
    const colors = isDarkMode ? themeConfig.dark : themeConfig.light

    Object.entries(colors).forEach(([key, value]) => {
      const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(`--${cssVarName}`, value)
    })

    root.style.setProperty('--radius', themeConfig.radius)
    root.classList.toggle('dark', isDarkMode)
  }, [isDarkMode, themeConfig])

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setLocalColors(current => ({
      ...current,
      [colorKey]: value,
    }))
  }

  const handleSave = () => {
    setThemeConfig(current => {
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

        <CardContent className="space-y-6">
          <Tabs
            value={editingTheme}
            onValueChange={value => setEditingTheme(value as 'light' | 'dark')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="light">Light Theme</TabsTrigger>
              <TabsTrigger value="dark">Dark Theme</TabsTrigger>
            </TabsList>

            <TabsContent value={editingTheme} className="space-y-6">
              <PaletteEditor
                colors={localColors}
                radius={localRadius}
                onColorChange={handleColorChange}
                onRadiusChange={setLocalRadius}
              />

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

          <PreviewPane />
        </CardContent>
      </Card>
    </div>
  )
}
