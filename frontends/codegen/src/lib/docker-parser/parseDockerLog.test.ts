import { describe, expect, it } from 'vitest'
import { parseDockerLog } from './parseDockerLog'

describe('parseDockerLog', () => {
  it('returns empty array for log with no errors', () => {
    const result = parseDockerLog('Step 1/3 : FROM node:18\nSuccessfully built abc123')
    expect(result).toHaveLength(0)
  })

  it('parses a single ERROR: line', () => {
    const log = 'Step 2/3 : RUN npm install\nERROR: Something went wrong'
    const result = parseDockerLog(log)
    expect(result).toHaveLength(1)
    expect(result[0].message).toBe('Something went wrong')
    expect(result[0].severity).toBe('critical')
    expect(result[0].id).toBeDefined()
    expect(typeof result[0].id).toBe('string')
  })

  it('parses a single Error: line (capital E)', () => {
    const log = 'Error: Cannot find module react'
    const result = parseDockerLog(log)
    expect(result).toHaveLength(1)
  })

  it('parses multiple errors', () => {
    const log = [
      'starting build',
      'ERROR: first failure',
      'some context',
      'ERROR: second failure',
    ].join('\n')
    const result = parseDockerLog(log)
    expect(result).toHaveLength(2)
  })

  it('assigns unique ids to errors', () => {
    const log = 'ERROR: one\nERROR: two'
    const result = parseDockerLog(log)
    expect(result[0].id).not.toBe(result[1].id)
  })

  it('collects context lines for errors', () => {
    const log = [
      'ERROR: some error',
      'context line 1',
      'context line 2',
    ].join('\n')
    const result = parseDockerLog(log)
    expect(result[0].context).toContain('context line 1')
    expect(result[0].context).toContain('context line 2')
  })

  it('extracts exit code from error line', () => {
    const log = 'ERROR: process failed with exit code: 1'
    const result = parseDockerLog(log)
    expect(result[0].exitCode).toBe(1)
  })

  it('extracts build stage from full log context', () => {
    const log = '[builder 2/5] RUN npm install\nERROR: failed'
    const result = parseDockerLog(log)
    expect(result[0].stage).toBe('builder')
  })

  it('assigns type via detectErrorType', () => {
    const log = 'ERROR: Cannot find module lodash'
    const result = parseDockerLog(log)
    expect(result[0].type).toBe('Missing Dependency')
  })

  it('handles empty string', () => {
    expect(parseDockerLog('')).toHaveLength(0)
  })
})
