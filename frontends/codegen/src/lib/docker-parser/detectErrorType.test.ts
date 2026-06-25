import { describe, expect, it } from 'vitest'
import { detectErrorType } from './detectErrorType'

describe('detectErrorType', () => {
  it('detects Missing Dependency for "cannot find module"', () => {
    expect(detectErrorType('Error: Cannot find module foo', '')).toBe('Missing Dependency')
  })

  it('detects Missing Dependency for MODULE_NOT_FOUND', () => {
    expect(detectErrorType('MODULE_NOT_FOUND', '')).toBe('Missing Dependency')
  })

  it('detects File Not Found for ENOENT', () => {
    expect(detectErrorType('ENOENT: no such file', '')).toBe('File Not Found')
  })

  it('detects File Not Found for "no such file"', () => {
    expect(detectErrorType('no such file or directory', '')).toBe('File Not Found')
  })

  it('detects Platform/Architecture Issue from log containing arm64', () => {
    expect(detectErrorType('build error', 'building for arm64 platform')).toBe(
      'Platform/Architecture Issue'
    )
  })

  it('detects Platform/Architecture Issue from log containing amd64', () => {
    expect(detectErrorType('build error', 'targeting amd64')).toBe('Platform/Architecture Issue')
  })

  it('detects Platform/Architecture Issue from error line containing platform', () => {
    expect(detectErrorType('wrong platform error', '')).toBe('Platform/Architecture Issue')
  })

  it('detects Permission Error for permission denied', () => {
    expect(detectErrorType('permission denied /app/build', '')).toBe('Permission Error')
  })

  it('detects Permission Error for EACCES', () => {
    expect(detectErrorType('EACCES: permission denied', '')).toBe('Permission Error')
  })

  it('detects Network Error for network keyword', () => {
    expect(detectErrorType('network error occurred', '')).toBe('Network Error')
  })

  it('detects Network Error for timeout', () => {
    expect(detectErrorType('connection timeout', '')).toBe('Network Error')
  })

  it('detects Network Error for connection', () => {
    expect(detectErrorType('connection refused', '')).toBe('Network Error')
  })

  it('detects Syntax Error for syntax keyword', () => {
    expect(detectErrorType('syntax error at line 5', '')).toBe('Syntax Error')
  })

  it('detects Syntax Error for unexpected keyword', () => {
    expect(detectErrorType('unexpected token {', '')).toBe('Syntax Error')
  })

  it('detects Resource Limit for memory keyword', () => {
    expect(detectErrorType('memory limit exceeded', '')).toBe('Resource Limit')
  })

  it('detects Resource Limit for "out of"', () => {
    expect(detectErrorType('out of disk space', '')).toBe('Resource Limit')
  })

  it('falls back to Build Failure for unknown errors', () => {
    expect(detectErrorType('something weird happened', '')).toBe('Build Failure')
  })
})
