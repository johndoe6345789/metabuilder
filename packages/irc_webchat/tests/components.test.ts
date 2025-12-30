import { describe, it, expect } from 'vitest'
import components from '../seed/components.json'
import metadata from '../seed/metadata.json'

interface ComponentDefinition {
  id: string
  type: string
  props?: Record<string, unknown>
  children?: unknown[]
}

describe('IRC Webchat Components', () => {
  it('should have valid metadata', () => {
    expect(metadata.packageId).toBe('irc_webchat')
    expect(metadata.name).toBe('IRC Webchat')
    expect(metadata.version).toBe('1.0.0')
    expect(metadata.category).toBe('social')
  })

  it('should be a valid array', () => {
    expect(components).toBeInstanceOf(Array)
  })

  it('should have valid component structure', () => {
    components.forEach((component: ComponentDefinition) => {
      expect(component.id).toBeDefined()
      expect(component.type).toBeDefined()
      expect(typeof component.id).toBe('string')
      expect(typeof component.type).toBe('string')
    })
  })

  it('should export IRCWebchat component', () => {
    expect(metadata.exports.components).toContain('IRCWebchat')
  })

  it('should export all lua scripts', () => {
    const expectedScripts = ['send_message', 'handle_command', 'format_time', 'user_join', 'user_leave']
    expectedScripts.forEach(script => {
      expect(metadata.exports.luaScripts).toContain(script)
    })
  })
})
