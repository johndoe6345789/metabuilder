/**
 * Tests for compiler utilities
 */

import { describe, it, expect, vi } from 'vitest'

// Mock server-only
vi.mock('server-only', () => ({}))

// Mock esbuild
vi.mock('esbuild', () => ({
  transform: vi.fn(),
}))

import { compile } from './index'
import { transform } from 'esbuild'

const mockTransform = vi.mocked(transform)

describe('compile', () => {
  it.each([
    {
      scenario: 'basic JavaScript code',
      source: 'const x = 1;',
      options: undefined,
      mockResult: { code: 'const x=1;', map: '' },
      expectedCode: 'const x=1;',
      expectedMap: undefined,
    },
    {
      scenario: 'TypeScript code',
      source: 'const x: number = 1;',
      options: undefined,
      mockResult: { code: 'const x=1;', map: '' },
      expectedCode: 'const x=1;',
      expectedMap: undefined,
    },
    {
      scenario: 'code with minification enabled',
      source: 'const x = 1;\nconst y = 2;',
      options: { minify: true },
      mockResult: { code: 'const x=1,y=2;', map: '' },
      expectedCode: 'const x=1,y=2;',
      expectedMap: undefined,
    },
    {
      scenario: 'code with source maps enabled',
      source: 'const x = 1;',
      options: { sourceMaps: true },
      mockResult: { code: 'const x=1;', map: '{"version":3}' },
      expectedCode: 'const x=1;',
      expectedMap: '{"version":3}',
    },
    {
      scenario: 'code with both minification and source maps',
      source: 'const x = 1;',
      options: { minify: true, sourceMaps: true },
      mockResult: { code: 'const x=1;', map: '{"version":3}' },
      expectedCode: 'const x=1;',
      expectedMap: '{"version":3}',
    },
  ])('should compile $scenario', async ({ source, options, mockResult, expectedCode, expectedMap }) => {
    mockTransform.mockResolvedValue(mockResult as never)

    const result = await compile(source, options)

    expect(result.code).toBe(expectedCode)
    expect(result.map).toBe(expectedMap)
    
    // Verify transform was called with correct options
    expect(mockTransform).toHaveBeenCalledWith(source, {
      loader: 'ts',
      minify: options?.minify ?? false,
      sourcemap: options?.sourceMaps ?? false,
      target: 'es2020',
      format: 'esm',
    })
  })

  it.each([
    {
      scenario: 'syntax error',
      source: 'const x = ;',
      error: new Error('Unexpected token'),
    },
    {
      scenario: 'invalid TypeScript',
      source: 'const x: invalid = 1;',
      error: new Error('Type error'),
    },
  ])('should handle compilation error for $scenario', async ({ source, error }) => {
    mockTransform.mockRejectedValue(error)

    const result = await compile(source)

    // Should return source with error comment
    expect(result.code).toContain('// Compilation Error:')
    expect(result.code).toContain(error.message)
    expect(result.code).toContain(source)
    expect(result.map).toBeUndefined()
  })

  it('should handle non-Error exceptions', async () => {
    mockTransform.mockRejectedValue('String error')

    const result = await compile('const x = 1;')

    expect(result.code).toContain('// Compilation Error:')
    expect(result.code).toContain('String error')
  })

  it('should use default options when none provided', async () => {
    const source = 'const x = 1;'
    mockTransform.mockResolvedValue({ code: source, map: '' } as never)

    await compile(source)

    expect(mockTransform).toHaveBeenCalledWith(source, {
      loader: 'ts',
      minify: false,
      sourcemap: false,
      target: 'es2020',
      format: 'esm',
    })
  })
})
