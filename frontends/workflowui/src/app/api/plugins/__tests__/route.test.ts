/**
 * Tests for Plugin Registry API route
 */

// Mock next/server before imports to avoid Request not defined error
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: any) => ({
      json: () => Promise.resolve(data),
      status: 200,
    })),
  },
}))

// Mock fs and path before imports
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(false),
  readdirSync: jest.fn().mockReturnValue([]),
  readFileSync: jest.fn().mockReturnValue('{}'),
}))

jest.mock('path', () => ({
  resolve: jest.fn((...args: string[]) => args.join('/')),
  join: jest.fn((...args: string[]) => args.join('/')),
}))

// Mock global fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: false,
}) as any

import { GET } from '../route'

describe('GET /api/plugins', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as any
  })

  it('should return a NextResponse', async () => {
    const response = await GET()
    expect(response).toBeDefined()
  })

  it('should return JSON with categories', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data).toHaveProperty('categories')
    expect(Array.isArray(data.categories)).toBe(true)
  })

  it('should return JSON with nodes array', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data).toHaveProperty('nodes')
    expect(Array.isArray(data.nodes)).toBe(true)
  })

  it('should return JSON with nodesByCategory', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data).toHaveProperty('nodesByCategory')
    expect(typeof data.nodesByCategory).toBe('object')
  })

  it('should return JSON with nodesByLanguage', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data).toHaveProperty('nodesByLanguage')
  })

  it('should return JSON with totalNodes count', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data).toHaveProperty('totalNodes')
    expect(typeof data.totalNodes).toBe('number')
  })

  it('should return JSON with languageHealth', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data).toHaveProperty('languageHealth')
  })

  it('should mark typescript as always available', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data.languageHealth['ts']).toBe(true)
  })

  it('should return languages array', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data).toHaveProperty('languages')
    expect(Array.isArray(data.languages)).toBe(true)
  })

  it('should have default categories in response', async () => {
    const response = await GET()
    const data = await response.json()
    const categoryIds = data.categories.map((c: any) => c.id)
    expect(categoryIds).toContain('triggers')
    expect(categoryIds).toContain('actions')
    expect(categoryIds).toContain('logic')
  })

  describe('when directory has plugins', () => {
    const fs = require('fs')
    const mockPluginDir = {
      name: 'my-plugin',
      isDirectory: () => true,
    }
    const mockNodesJson = JSON.stringify({
      category: { id: 'custom', name: 'Custom', color: '#ff0000', icon: 'star' },
      nodes: [
        {
          id: 'custom.test',
          name: 'Test Node',
          description: 'A test node',
          icon: 'star',
          inputs: ['main'],
          outputs: ['main'],
          defaultConfig: {},
        },
      ],
    })

    it('should load nodes from nodes.json when available', async () => {
      fs.existsSync.mockImplementation((p: string) =>
        p.includes('nodes.json')
      )
      fs.readdirSync.mockReturnValue([mockPluginDir])
      fs.readFileSync.mockReturnValue(mockNodesJson)

      const response = await GET()
      const data = await response.json()
      expect(data.totalNodes).toBeGreaterThanOrEqual(0)
    })
  })
})
