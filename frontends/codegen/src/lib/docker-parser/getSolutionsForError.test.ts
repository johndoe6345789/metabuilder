import { describe, expect, it } from 'vitest'
import { getSolutionsForError } from './getSolutionsForError'
import type { DockerError } from '@/types/docker'

function makeError(type: string, message = ''): DockerError {
  return {
    id: 'err-1',
    type,
    message,
    severity: 'critical',
    context: [],
  }
}

describe('getSolutionsForError', () => {
  it('returns rollup-specific solutions for rollup missing dependency', () => {
    const error = makeError('Missing Dependency', 'Cannot find @rollup/rollup module')
    const solutions = getSolutionsForError(error)
    expect(solutions.length).toBeGreaterThanOrEqual(2)
    expect(solutions.some(s => s.title.toLowerCase().includes('rollup'))).toBe(true)
  })

  it('returns generic missing module solution for non-rollup missing dependency', () => {
    const error = makeError('Missing Dependency', 'Cannot find module lodash')
    const solutions = getSolutionsForError(error)
    expect(solutions.length).toBeGreaterThanOrEqual(1)
    expect(solutions[0].title).toContain('Missing Node Module')
  })

  it('returns platform solutions for platform/architecture issue', () => {
    const error = makeError('Platform/Architecture Issue')
    const solutions = getSolutionsForError(error)
    expect(solutions.length).toBeGreaterThanOrEqual(2)
    expect(solutions.some(s => s.title.toLowerCase().includes('platform'))).toBe(true)
  })

  it('returns file path solutions for file not found error', () => {
    const error = makeError('File Not Found')
    const solutions = getSolutionsForError(error)
    expect(solutions.length).toBeGreaterThanOrEqual(1)
    expect(solutions[0].title).toContain('File Path')
  })

  it('returns permission solutions for permission error', () => {
    const error = makeError('Permission Error')
    const solutions = getSolutionsForError(error)
    expect(solutions.length).toBeGreaterThanOrEqual(1)
    expect(solutions[0].title).toContain('Permission')
  })

  it('returns general troubleshooting for unknown error type', () => {
    const error = makeError('Unknown Strange Error')
    const solutions = getSolutionsForError(error)
    expect(solutions).toHaveLength(1)
    expect(solutions[0].title).toContain('General Docker Build')
  })

  it('each solution has title and description', () => {
    const error = makeError('Missing Dependency', 'Cannot find rollup')
    const solutions = getSolutionsForError(error)
    solutions.forEach(sol => {
      expect(sol.title).toBeDefined()
      expect(sol.description).toBeDefined()
    })
  })

  it('each solution has non-empty steps array', () => {
    const error = makeError('Permission Error')
    const solutions = getSolutionsForError(error)
    solutions.forEach(sol => {
      expect(Array.isArray(sol.steps)).toBe(true)
      expect(sol.steps!.length).toBeGreaterThan(0)
    })
  })
})
