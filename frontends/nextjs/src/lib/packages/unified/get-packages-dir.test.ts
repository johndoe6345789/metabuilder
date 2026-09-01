import { afterEach, describe, expect, it, vi } from 'vitest'
import { join, resolve } from 'path'
import { getPackagesDir } from './get-packages-dir'

const originalCwd = process.cwd

afterEach(() => {
  process.cwd = originalCwd
})

describe('getPackagesDir', () => {
  it('goes up two levels when running from frontends/nextjs', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/repo/frontends/nextjs')
    expect(getPackagesDir()).toBe(join(resolve('/repo/frontends/nextjs', '../..'), 'packages'))
  })

  it('joins packages directly onto any other cwd', () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/repo')
    expect(getPackagesDir()).toBe(join('/repo', 'packages'))
  })
})
