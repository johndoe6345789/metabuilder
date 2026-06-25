import { AI_PLATFORMS, DEFAULT_PLATFORM_ID, getPlatform } from './aiPlatforms'

describe('aiPlatforms', () => {
  describe('AI_PLATFORMS array', () => {
    it('has at least one platform', () => {
      expect(AI_PLATFORMS.length).toBeGreaterThan(0)
    })

    it('contains an OpenAI platform', () => {
      const openai = AI_PLATFORMS.find(p => p.id === 'openai')
      expect(openai).toBeDefined()
    })

    it('contains an Anthropic platform', () => {
      const anthropic = AI_PLATFORMS.find(p => p.id === 'anthropic')
      expect(anthropic).toBeDefined()
    })

    it('every platform has required fields', () => {
      for (const p of AI_PLATFORMS) {
        expect(p.id).toBeTruthy()
        expect(p.name).toBeTruthy()
        expect(p.endpoint).toBeTruthy()
        expect(p.defaultModel).toBeTruthy()
        expect(p.keyPlaceholder).toBeTruthy()
        expect(typeof p.keyRequired).toBe('boolean')
        expect(p.docsUrl).toBeTruthy()
        expect(p.docsLabel).toBeTruthy()
        expect(['openai', 'anthropic']).toContain(p.apiFormat)
      }
    })

    it('all platform ids are unique', () => {
      const ids = AI_PLATFORMS.map(p => p.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('all endpoint URLs start with https or http', () => {
      for (const p of AI_PLATFORMS) {
        expect(p.endpoint).toMatch(/^https?:\/\//)
      }
    })
  })

  describe('DEFAULT_PLATFORM_ID', () => {
    it('is a non-empty string', () => {
      expect(typeof DEFAULT_PLATFORM_ID).toBe('string')
      expect(DEFAULT_PLATFORM_ID.length).toBeGreaterThan(0)
    })

    it('corresponds to an existing platform', () => {
      const found = AI_PLATFORMS.find(p => p.id === DEFAULT_PLATFORM_ID)
      expect(found).toBeDefined()
    })
  })

  describe('getPlatform', () => {
    it('returns the platform with the given id', () => {
      const p = getPlatform('anthropic')
      expect(p.id).toBe('anthropic')
      expect(p.name).toBe('Anthropic')
    })

    it('returns OpenAI for unknown id (falls back to first)', () => {
      const p = getPlatform('nonexistent')
      expect(p).toEqual(AI_PLATFORMS[0])
    })

    it('returns correct platform for each id', () => {
      for (const platform of AI_PLATFORMS) {
        expect(getPlatform(platform.id).id).toBe(platform.id)
      }
    })

    it('returns Ollama platform', () => {
      const p = getPlatform('ollama')
      expect(p.id).toBe('ollama')
      expect(p.keyRequired).toBe(false)
    })
  })
})
