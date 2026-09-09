import { describe, expect, it } from 'vitest'

import { romUrlProblem } from './rom-url'

describe('romUrlProblem', () => {
  it.each([
    'https://roms.example/mario.nes',
    'http://localhost:9000/games/mario.nes',
  ])('accepts %s', url => {
    expect(romUrlProblem(url)).toBeNull()
  })

  it('trims before judging', () => {
    expect(romUrlProblem('  https://roms.example/a.nes  ')).toBeNull()
  })

  /**
   * The form took any non-empty string, so a typo or a bare filename
   * went to the daemon and came back as an error the player could not
   * connect to what they had typed.
   */
  it.each([
    ['nothing at all', '   ', 'Paste the address'],
    ['a bare filename', 'mario.nes', 'not a web address'],
    ['a path', '/roms/mario.nes', 'not a web address'],
  ])('explains %s', (_case, value, expected) => {
    expect(romUrlProblem(value)).toContain(expected)
  })

  it.each(['file:///etc/passwd', 'ftp://roms.example/a.nes'])(
    'names the scheme it cannot use for %s',
    url => {
      expect(romUrlProblem(url)).toContain('http(s)')
    }
  )

  it('rejects an address with no host', () => {
    expect(romUrlProblem('https://')).not.toBeNull()
  })
})
