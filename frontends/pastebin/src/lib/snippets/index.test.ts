import {
  atomsCodeSnippets,
  moleculesCodeSnippets,
  organismsCodeSnippets,
  templatesCodeSnippets,
} from './index'

describe('snippets barrel export', () => {
  test('exports atomsCodeSnippets', () => {
    expect(atomsCodeSnippets).toBeDefined()
    expect(typeof atomsCodeSnippets).toBe('object')
  })

  test('exports moleculesCodeSnippets', () => {
    expect(moleculesCodeSnippets).toBeDefined()
    expect(typeof moleculesCodeSnippets).toBe('object')
  })

  test('exports organismsCodeSnippets', () => {
    expect(organismsCodeSnippets).toBeDefined()
    expect(typeof organismsCodeSnippets).toBe('object')
  })

  test('exports templatesCodeSnippets', () => {
    expect(templatesCodeSnippets).toBeDefined()
    expect(typeof templatesCodeSnippets).toBe('object')
  })

  test('all exports are objects with content', () => {
    expect(Object.keys(atomsCodeSnippets).length).toBeGreaterThan(0)
    expect(Object.keys(moleculesCodeSnippets).length).toBeGreaterThan(0)
    expect(Object.keys(organismsCodeSnippets).length).toBeGreaterThan(0)
    expect(Object.keys(templatesCodeSnippets).length).toBeGreaterThan(0)
  })
})
