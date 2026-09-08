import { beforeEach, describe, expect, it } from 'vitest'

import { readTreePath, TREE_PATH_KEY, writeTreePath } from './tree-path'
import { TREE_TENANT_KEY } from './tree-tenant'

beforeEach(() => localStorage.clear())

describe('the path a stored tree is live at', () => {
  it('is unknown until something records it', () => {
    expect(readTreePath('acme')).toBeNull()
  })

  it('round-trips for the tenant that wrote it', () => {
    writeTreePath('acme', '/about')
    expect(readTreePath('acme')).toBe('/about')
  })

  it('names the tenant along with the path', () => {
    writeTreePath('acme', '/about')
    expect(localStorage.getItem(TREE_TENANT_KEY)).toBe('acme')
    expect(localStorage.getItem(TREE_PATH_KEY)).toBe('/about')
  })

  // After a tenant switch the tree the record described has been blanked,
  // so the record must not make the blank tree look "live at /about".
  it('is not believed for another tenant', () => {
    writeTreePath('acme', '/about')
    expect(readTreePath('globex')).toBeNull()
  })

  it('is not believed once the tenant marker has moved on', () => {
    writeTreePath('acme', '/about')
    localStorage.setItem(TREE_TENANT_KEY, 'globex')
    expect(readTreePath('acme')).toBeNull()
  })
})
