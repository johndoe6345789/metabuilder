import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, mkdirSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

import { resolvePackagesPath } from './packages-path'

const dirs: string[] = []
afterEach(() => {
  dirs.splice(0).forEach(d => {
    rmSync(d, { recursive: true, force: true })
  })
  vi.restoreAllMocks()
})

const cwdWith = (child?: string): string => {
  const root = mkdtempSync(join(tmpdir(), 'pkg-path-'))
  dirs.push(root)
  if (child !== undefined) mkdirSync(join(root, child), { recursive: true })
  vi.spyOn(process, 'cwd').mockReturnValue(root)
  return root
}

describe('resolvePackagesPath', () => {
  it('prefers a packages directory beside the working directory', () => {
    const root = cwdWith('packages')
    expect(resolvePackagesPath()).toBe(join(root, 'packages'))
  })

  it('falls back to the first candidate when none exists', () => {
    // A path that does not exist is still a usable answer: the caller reports
    // "no packages found" rather than crashing on undefined.
    const root = cwdWith()
    expect(resolvePackagesPath()).toBe(join(root, 'packages'))
  })

  it('always returns an absolute path', () => {
    cwdWith('packages')
    expect(resolvePackagesPath().startsWith('/')).toBe(true)
  })
})
