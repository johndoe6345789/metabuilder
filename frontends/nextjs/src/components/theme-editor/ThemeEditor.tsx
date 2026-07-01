'use client'

import { Typography, Button, Tabs, Tab, Paper } from '@/m3'
import { SwatchList } from './SwatchList'
import { ThemePreview } from './ThemePreview'
import { useThemeEditor } from './useThemeEditor'
import s from './ThemeEditor.module.scss'

export function ThemeEditor() {
  const {
    lightColors, darkColors, activeTab, setActiveTab,
    updateColor, applyColors, resetColors, saveColors,
  } = useThemeEditor()

  const currentColors = activeTab === 'light' ? lightColors : darkColors

  function handleApply() {
    applyColors(currentColors)
  }

  function handleSave() {
    saveColors(lightColors, darkColors)
    applyColors(currentColors)
  }

  return (
    <div className={s.root}>
      <Typography variant="h6" gutterBottom>
        Theme Configuration
      </Typography>
      <Typography variant="body2" className={s.subtitle}>
        Edit CSS custom properties. Changes apply live to the page.
      </Typography>

      <Tabs
        value={activeTab === 'light' ? 0 : 1}
        onChange={(_e, v) => {
          setActiveTab((v as number) === 0 ? 'light' : 'dark')
        }}
        className={s.tabs}
      >
        <Tab label="Light Theme" />
        <Tab label="Dark Theme" />
      </Tabs>

      <Paper className={s.editor} variant="outlined">
        <SwatchList
          colors={currentColors}
          tab={activeTab}
          onChange={updateColor}
        />
      </Paper>

      <ThemePreview />

      <div className={s.actions}>
        <Button variant="contained" onClick={handleApply}>
          Apply
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" onClick={resetColors}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
