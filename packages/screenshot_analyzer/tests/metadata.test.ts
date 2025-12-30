import { describe, it, expect } from 'vitest'
import metadata from '../seed/metadata.json'
import components from '../seed/components.json'
import scriptsManifest from '../seed/scripts/manifest.json'

describe('Screenshot Analyzer Package Metadata', () => {
  it('should have valid package structure', () => {
    expect(metadata.name).toBe('screenshot_analyzer')
    expect(metadata.version).toBe('1.0.0')
    expect(metadata.description).toBeDefined()
  })

  it('should have correct minLevel for God access', () => {
    expect(metadata.minLevel).toBe(5)
  })

  it('should have demo category', () => {
    expect(metadata.category).toBe('demo')
  })

  it('should have browser bindings enabled', () => {
    expect(metadata.bindings).toBeDefined()
    expect(metadata.bindings.dbal).toBe(false)
    expect(metadata.bindings.browser).toBe(true)
  })

  it('should export components', () => {
    expect(metadata.exports.components).toContain('ScreenshotAnalyzer')
    expect(metadata.exports.components).toContain('UploadSection')
    expect(metadata.exports.components).toContain('ResultPanel')
    expect(metadata.exports.components).toContain('PageInfo')
  })

  it('should export scripts', () => {
    expect(metadata.exports.scripts).toContain('init')
    expect(metadata.exports.scripts).toContain('capture')
    expect(metadata.exports.scripts).toContain('analyze')
    expect(metadata.exports.scripts).toContain('page_info')
  })
})

describe('Screenshot Analyzer Package Components', () => {
  it('should define ScreenshotAnalyzer component', () => {
    expect(components.ScreenshotAnalyzer).toBeDefined()
    expect(components.ScreenshotAnalyzer.type).toBe('ScreenshotAnalyzer')
    expect(components.ScreenshotAnalyzer.category).toBe('demo')
  })

  it('should define ScreenshotAnalyzer with browser bindings', () => {
    expect(components.ScreenshotAnalyzer.bindings?.browser).toBe(true)
  })

  it('should define UploadSection with browser bindings', () => {
    expect(components.UploadSection).toBeDefined()
    expect(components.UploadSection.bindings?.browser).toBe(true)
  })

  it('should define ResultPanel component', () => {
    expect(components.ResultPanel).toBeDefined()
    expect(components.ResultPanel.bindings?.browser).toBe(false)
  })

  it('should define PageInfo with browser bindings', () => {
    expect(components.PageInfo).toBeDefined()
    expect(components.PageInfo.bindings?.browser).toBe(true)
  })

  it('should have valid component configs', () => {
    Object.values(components).forEach((component: unknown) => {
      const comp = component as { type: string; category: string; config: { layout: string } }
      expect(comp.type).toBeDefined()
      expect(comp.category).toBeDefined()
      expect(comp.config).toBeDefined()
      expect(comp.config.layout).toBeDefined()
    })
  })
})

describe('Screenshot Analyzer Package Scripts', () => {
  it('should have scripts manifest', () => {
    expect(scriptsManifest.scripts).toBeDefined()
    expect(scriptsManifest.scripts.length).toBeGreaterThan(0)
  })

  it.each([
    ['init', 'lifecycle'],
    ['capture', 'screenshot'],
    ['analyze', 'analysis'],
    ['page_info', 'browser'],
  ])('should have %s script in %s category', (name: string, category: string) => {
    const script = scriptsManifest.scripts.find((s: { name: string }) => s.name === name)
    expect(script).toBeDefined()
    expect(script?.category).toBe(category)
  })
})
