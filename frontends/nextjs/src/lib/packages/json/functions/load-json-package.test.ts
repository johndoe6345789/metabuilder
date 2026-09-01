import { describe, expect, it, vi, beforeEach } from 'vitest'

const fs = vi.hoisted(() => ({ readFile: vi.fn() }))
vi.mock('fs/promises', () => ({ ...fs, default: fs }))

import { loadJSONPackage } from './load-json-package'

const METADATA = {
  packageId: 'demo',
  name: 'Demo',
  version: '1.0.0',
  description: 'A demo package',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('loadJSONPackage', () => {
  it('reads metadata and reports every optional file missing', async () => {
    fs.readFile.mockImplementation((path: string) => {
      if (path.endsWith('package.json')) {
        return Promise.resolve(JSON.stringify(METADATA))
      }
      return Promise.reject(new Error('ENOENT'))
    })

    const pkg = await loadJSONPackage('/pkgs/demo')

    expect(pkg.metadata).toEqual(METADATA)
    expect(pkg.hasComponents).toBe(false)
    expect(pkg.hasPermissions).toBe(false)
    expect(pkg.hasStyles).toBe(false)
    expect(pkg.components).toBeUndefined()
    expect(pkg.permissions).toBeUndefined()
  })

  it('picks up components, permissions, and styles when all are present', async () => {
    fs.readFile.mockImplementation((path: string) => {
      if (path.endsWith('package.json')) {
        return Promise.resolve(JSON.stringify(METADATA))
      }
      if (path.endsWith('ui.json')) {
        return Promise.resolve(
          JSON.stringify({ components: [{ id: 'btn', name: 'Button' }] })
        )
      }
      if (path.endsWith('roles.json')) {
        return Promise.resolve(
          JSON.stringify({
            permissions: [
              {
                id: 'view',
                name: 'View',
                description: 'Can view',
                resource: 'page',
                action: 'read',
              },
            ],
          })
        )
      }
      if (path.endsWith('index.json')) {
        return Promise.resolve('{}')
      }
      return Promise.reject(new Error('ENOENT'))
    })

    const pkg = await loadJSONPackage('/pkgs/demo')

    expect(pkg.hasComponents).toBe(true)
    expect(pkg.components).toEqual([{ id: 'btn', name: 'Button' }])
    expect(pkg.hasPermissions).toBe(true)
    expect(pkg.permissions).toHaveLength(1)
    expect(pkg.hasStyles).toBe(true)
  })

  it('treats an empty components array as not having components', async () => {
    fs.readFile.mockImplementation((path: string) => {
      if (path.endsWith('package.json')) {
        return Promise.resolve(JSON.stringify(METADATA))
      }
      if (path.endsWith('ui.json')) {
        return Promise.resolve(JSON.stringify({ components: [] }))
      }
      return Promise.reject(new Error('ENOENT'))
    })

    const pkg = await loadJSONPackage('/pkgs/demo')

    expect(pkg.hasComponents).toBe(false)
    expect(pkg.components).toEqual([])
  })

  it('rejects when the required metadata file is missing', async () => {
    fs.readFile.mockRejectedValue(new Error('ENOENT'))

    await expect(loadJSONPackage('/pkgs/missing')).rejects.toThrow()
  })
})
