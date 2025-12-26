import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PackageContent } from '@/lib/package-types'

const mockDatabase = {
  getSchemas: vi.fn(),
  getPages: vi.fn(),
  getWorkflows: vi.fn(),
  getLuaScripts: vi.fn(),
  getComponentHierarchy: vi.fn(),
  getComponentConfigs: vi.fn(),
  setSchemas: vi.fn(),
  setPages: vi.fn(),
  setWorkflows: vi.fn(),
  setLuaScripts: vi.fn(),
  setComponentHierarchy: vi.fn(),
  setComponentConfigs: vi.fn(),
  getCssClasses: vi.fn(),
  setCssClasses: vi.fn(),
  getDropdownConfigs: vi.fn(),
  setDropdownConfigs: vi.fn(),
  setPackageData: vi.fn(),
}

vi.mock('@/lib/database', () => ({
  Database: mockDatabase,
}))

import { installPackageContent } from './install-package-content'

describe('installPackageContent', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockDatabase)) {
      mockDatabase[key as keyof typeof mockDatabase].mockReset()
    }
  })

  it('merges content by key and preserves latest values', async () => {
    mockDatabase.getSchemas.mockResolvedValue([
      { name: 'schemaA', version: 1 },
      { name: 'schemaB', version: 1 },
    ])
    mockDatabase.getPages.mockResolvedValue([
      { id: 'page-1', slug: '/one' },
      { id: 'page-2', slug: '/old' },
    ])
    mockDatabase.getWorkflows.mockResolvedValue([
      { id: 'wf-1', name: 'workflow-one' },
      { id: 'wf-2', name: 'workflow-old' },
    ])
    mockDatabase.getLuaScripts.mockResolvedValue([
      { id: 'lua-1', name: 'lua-one' },
      { id: 'lua-2', name: 'lua-old' },
    ])
    mockDatabase.getComponentHierarchy.mockResolvedValue({
      comp1: { id: 'comp1', type: 'old' },
      comp2: { id: 'comp2', type: 'old' },
    })
    mockDatabase.getComponentConfigs.mockResolvedValue({
      cfg1: { id: 'cfg1', type: 'old' },
      cfg2: { id: 'cfg2', type: 'old' },
    })
    mockDatabase.getCssClasses.mockResolvedValue([
      { name: 'primary', value: 'old' },
    ])
    mockDatabase.getDropdownConfigs.mockResolvedValue([
      { id: 'dropdown-1', label: 'old' },
      { id: 'dropdown-2', label: 'old' },
    ])

    const content: PackageContent = {
      schemas: [
        { name: 'schemaB', version: 2 },
        { name: 'schemaC', version: 1 },
      ],
      pages: [
        { id: 'page-2', slug: '/two' },
      ],
      workflows: [
        { id: 'wf-2', name: 'workflow-new' },
      ],
      luaScripts: [
        { id: 'lua-2', name: 'lua-new' },
      ],
      componentHierarchy: {
        comp2: { id: 'comp2', type: 'new' },
      },
      componentConfigs: {
        cfg2: { id: 'cfg2', type: 'new' },
      },
      cssClasses: [
        { name: 'primary', value: 'new' },
      ],
      dropdownConfigs: [
        { id: 'dropdown-2', label: 'new' },
      ],
      seedData: {
        table: [{ id: 'row1' }],
      },
    }

    await installPackageContent('pkg-1', content)

    const schemasArg = mockDatabase.setSchemas.mock.calls[0]?.[0] as Array<{ name: string; version: number }>
    expect(schemasArg).toHaveLength(3)
    expect(schemasArg.find((schema) => schema.name === 'schemaB')?.version).toBe(2)

    const pagesArg = mockDatabase.setPages.mock.calls[0]?.[0] as Array<{ id: string; slug: string }>
    expect(pagesArg).toHaveLength(2)
    expect(pagesArg.find((page) => page.id === 'page-2')?.slug).toBe('/two')

    const workflowsArg = mockDatabase.setWorkflows.mock.calls[0]?.[0] as Array<{ id: string; name: string }>
    expect(workflowsArg.find((workflow) => workflow.id === 'wf-2')?.name).toBe('workflow-new')

    const scriptsArg = mockDatabase.setLuaScripts.mock.calls[0]?.[0] as Array<{ id: string; name: string }>
    expect(scriptsArg.find((script) => script.id === 'lua-2')?.name).toBe('lua-new')

    const hierarchyArg = mockDatabase.setComponentHierarchy.mock.calls[0]?.[0] as Record<string, { id: string; type: string }>
    expect(hierarchyArg.comp2.type).toBe('new')

    const configsArg = mockDatabase.setComponentConfigs.mock.calls[0]?.[0] as Record<string, { id: string; type: string }>
    expect(configsArg.cfg2.type).toBe('new')

    const cssArg = mockDatabase.setCssClasses.mock.calls[0]?.[0] as Array<{ name: string; value: string }>
    expect(cssArg).toHaveLength(1)
    expect(cssArg[0]?.value).toBe('new')

    const dropdownArg = mockDatabase.setDropdownConfigs.mock.calls[0]?.[0] as Array<{ id: string; label: string }>
    expect(dropdownArg.find((dropdown) => dropdown.id === 'dropdown-2')?.label).toBe('new')

    expect(mockDatabase.setPackageData).toHaveBeenCalledWith('pkg-1', content.seedData)
  })
})
