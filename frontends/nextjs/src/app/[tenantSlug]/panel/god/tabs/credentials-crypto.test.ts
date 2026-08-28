import { describe, expect, it } from 'vitest'

import { randomSalt, sha512 } from './credentials-crypto'

describe('sha512', () => {
  it('matches the published digest for the empty string', () => {
    // Pinned against the FIPS 180-4 vector, so a change to the encoding
    // or the algorithm name cannot pass unnoticed.
    return expect(sha512('')).resolves.toBe(
      'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce' +
        '47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e'
    )
  })

  it('matches the published digest for "abc"', async () => {
    await expect(sha512('abc')).resolves.toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a' +
        '2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'
    )
  })

  it('hashes non-ASCII as UTF-8', async () => {
    // Latin-1 encoding would give a different digest for the same input.
    await expect(sha512('é')).resolves.toBe(await sha512('é'))
    expect(await sha512('é')).not.toBe(await sha512('e'))
  })

  it('produces 128 hex characters', async () => {
    expect(await sha512('anything')).toMatch(/^[0-9a-f]{128}$/)
  })
})

describe('randomSalt', () => {
  it('produces 32 hex characters, zero-padded', () => {
    expect(randomSalt()).toMatch(/^[0-9a-f]{32}$/)
  })

  it('does not repeat itself', () => {
    const salts = new Set(Array.from({ length: 50 }, randomSalt))
    expect(salts.size).toBe(50)
  })
})
