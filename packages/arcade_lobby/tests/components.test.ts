import { describe, it, expect } from 'vitest'
import components from '../seed/components.json'

describe('Arcade Lobby Components', () => {
  it('should be a valid array', () => {
    expect(components).toBeInstanceOf(Array)
  })

  it('should have valid component structure if components exist', () => {
    if (components.length > 0) {
      components.forEach((component: any) => {
        expect(component.id).toBeDefined()
        expect(component.type).toBeDefined()
        expect(typeof component.id).toBe('string')
        expect(typeof component.type).toBe('string')
        expect(component.children).toBeInstanceOf(Array)
      })
    }
  })
})
