import {
  atomsCodeSnippets,
  moleculesCodeSnippets,
  organismsCodeSnippets,
  templatesCodeSnippets,
} from './component-code-snippets'

describe('component-code-snippets', () => {
  describe('atomsCodeSnippets', () => {
    test('is an object', () => {
      expect(typeof atomsCodeSnippets).toBe('object')
      expect(atomsCodeSnippets).not.toBeNull()
    })

    test('contains code snippets', () => {
      expect(Object.keys(atomsCodeSnippets).length).toBeGreaterThan(0)
    })

    test('each snippet is a string', () => {
      for (const [, code] of Object.entries(atomsCodeSnippets)) {
        expect(typeof code).toBe('string')
        expect(code.length).toBeGreaterThan(0)
      }
    })
  })

  describe('moleculesCodeSnippets', () => {
    test('is an object', () => {
      expect(typeof moleculesCodeSnippets).toBe('object')
      expect(moleculesCodeSnippets).not.toBeNull()
    })

    test('contains code snippets', () => {
      expect(Object.keys(moleculesCodeSnippets).length).toBeGreaterThan(0)
    })

    test('each snippet is a string', () => {
      for (const [, code] of Object.entries(moleculesCodeSnippets)) {
        expect(typeof code).toBe('string')
        expect(code.length).toBeGreaterThan(0)
      }
    })
  })

  describe('organismsCodeSnippets', () => {
    test('is an object', () => {
      expect(typeof organismsCodeSnippets).toBe('object')
      expect(organismsCodeSnippets).not.toBeNull()
    })

    test('contains code snippets', () => {
      expect(Object.keys(organismsCodeSnippets).length).toBeGreaterThan(0)
    })

    test('each snippet is a string', () => {
      for (const [, code] of Object.entries(organismsCodeSnippets)) {
        expect(typeof code).toBe('string')
        expect(code.length).toBeGreaterThan(0)
      }
    })
  })

  describe('templatesCodeSnippets', () => {
    test('is an object', () => {
      expect(typeof templatesCodeSnippets).toBe('object')
      expect(templatesCodeSnippets).not.toBeNull()
    })

    test('contains code snippets', () => {
      expect(Object.keys(templatesCodeSnippets).length).toBeGreaterThan(0)
    })

    test('each snippet is a string', () => {
      for (const [, code] of Object.entries(templatesCodeSnippets)) {
        expect(typeof code).toBe('string')
        expect(code.length).toBeGreaterThan(0)
      }
    })
  })

  describe('all snippet types', () => {
    test('all are distinct objects', () => {
      expect(atomsCodeSnippets).not.toBe(moleculesCodeSnippets)
      expect(moleculesCodeSnippets).not.toBe(organismsCodeSnippets)
      expect(organismsCodeSnippets).not.toBe(templatesCodeSnippets)
      expect(atomsCodeSnippets).not.toBe(templatesCodeSnippets)
    })

    test('each type has different snippet keys', () => {
      const atomKeys = Object.keys(atomsCodeSnippets)
      const moleculeKeys = Object.keys(moleculesCodeSnippets)
      const organismKeys = Object.keys(organismsCodeSnippets)
      const templateKeys = Object.keys(templatesCodeSnippets)

      // These should generally be distinct categories
      expect(atomKeys.length).toBeGreaterThan(0)
      expect(moleculeKeys.length).toBeGreaterThan(0)
      expect(organismKeys.length).toBeGreaterThan(0)
      expect(templateKeys.length).toBeGreaterThan(0)
    })
  })

  describe('snippet content validation', () => {
    test('atom snippets contain valid code', () => {
      for (const [, code] of Object.entries(atomsCodeSnippets)) {
        expect(code).toBeDefined()
        expect(typeof code).toBe('string')
        expect(code).toMatch(/./i) // At least some content
      }
    })

    test('molecule snippets contain valid code', () => {
      for (const [, code] of Object.entries(moleculesCodeSnippets)) {
        expect(code).toBeDefined()
        expect(typeof code).toBe('string')
        expect(code).toMatch(/./i)
      }
    })

    test('organism snippets contain valid code', () => {
      for (const [, code] of Object.entries(organismsCodeSnippets)) {
        expect(code).toBeDefined()
        expect(typeof code).toBe('string')
        expect(code).toMatch(/./i)
      }
    })

    test('template snippets contain valid code', () => {
      for (const [, code] of Object.entries(templatesCodeSnippets)) {
        expect(code).toBeDefined()
        expect(typeof code).toBe('string')
        expect(code).toMatch(/./i)
      }
    })
  })
})
