import { describe, expect, it } from 'bun:test'

import { loadPageFromLuaPackages } from './load-page-from-lua-packages'

describe('loadPageFromLuaPackages', () => {
  it('loads a page definition from Lua UI packages', async () => {
    const page = await loadPageFromLuaPackages('/example-form')

    expect(page).not.toBeNull()
    expect(page?.title).toBe('Example Form')
    expect(page?.layout).toBeDefined()
    expect(Object.keys(page?.actions ?? {})).toContain('handleFormSubmit')
  })

  it('returns null for paths that are not in Lua packages', async () => {
    const page = await loadPageFromLuaPackages('/does-not-exist')

    expect(page).toBeNull()
  })
})
