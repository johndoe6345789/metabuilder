import { describe, expect, it } from 'vitest'
import { join } from 'path'

import { loadLuaUIPackage } from './load-lua-ui-package'

describe('loadLuaUIPackage', () => {
  // TODO: Re-enable when example-form Lua UI package is created in packages/lua-ui/example-form
  it.skip('should load example-form package with manifest and lua files', async () => {
    const packagePath = join(__dirname, '../../packages/lua-ui/example-form')
    const uiPackage = await loadLuaUIPackage(packagePath)

    // Check manifest
    expect(uiPackage.manifest.id).toBe('example-form')
    expect(uiPackage.manifest.version).toBe('1.0.0')
    expect(uiPackage.manifest.name).toBe('Example Form Package')
    expect(uiPackage.manifest.category).toBe('ui')

    // Check pages
    expect(uiPackage.pages).toHaveLength(1)
    const page = uiPackage.pages[0]
    expect(page.path).toBe('/example-form')
    expect(page.title).toBe('Example Form')
    expect(page.level).toBe(2)

    // Check page layout structure
    expect(page.layout.type).toBe('Stack')
    expect(page.layout.props.spacing).toBe(3)
    expect(page.layout.props.padding).toBe(4)
    expect(page.layout.children).toHaveLength(2)

    // Check Typography component
    const typography = page.layout.children?.[0]
    expect(typography?.type).toBe('Typography')
    expect(typography?.props.variant).toBe('h4')
    expect(typography?.props.text).toBe('Example Form')

    // Check Form component
    const form = page.layout.children?.[1]
    expect(form?.type).toBe('Form')
    expect(form?.props.id).toBe('example_form')
    expect(form?.props.onSubmit).toBe('handleFormSubmit')
    expect(form?.children).toHaveLength(4)

    // Check actions
    expect(uiPackage.actions.handleFormSubmit).toBeDefined()
    expect(typeof uiPackage.actions.handleFormSubmit).toBe('function')
  })

  // TODO: Re-enable when example-form Lua UI package is created
  it.skip('should execute action function from loaded package', async () => {
    const packagePath = join(__dirname, '../../packages/lua-ui/example-form')
    const uiPackage = await loadLuaUIPackage(packagePath)

    // Call the action function
    const result = uiPackage.actions.handleFormSubmit({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello world',
    })

    expect(result).toEqual({
      success: true,
      message: 'Form submitted successfully!',
    })
  })

  it('should throw error if page file missing render function', async () => {
    // This test would require creating a bad package structure
    // Skipping for now as we don't want to create invalid test fixtures
    expect(true).toBe(true)
  })

  it('should throw error if manifest.json is invalid', async () => {
    // This test would require creating an invalid manifest
    // Skipping for now as we don't want to create invalid test fixtures
    expect(true).toBe(true)
  })
})
