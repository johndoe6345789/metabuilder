import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The lookup caches its answer in a module-level variable, so every test
// needs a fresh module registry to see a different environment.
const load = async (): Promise<() => string | null> => {
  vi.resetModules()
  const mod = await import('./master-password')
  return mod.getVaultMasterPassword
}

const original = process.env.VAULT_MASTER_PASSWORD

beforeEach(() => {
  delete process.env.VAULT_MASTER_PASSWORD
})

afterEach(() => {
  if (original === undefined) delete process.env.VAULT_MASTER_PASSWORD
  else process.env.VAULT_MASTER_PASSWORD = original
})

describe('getVaultMasterPassword', () => {
  it('is null when the variable is unset', async () => {
    expect((await load())()).toBeNull()
  })

  it('is null when the variable is empty', async () => {
    process.env.VAULT_MASTER_PASSWORD = ''
    expect((await load())()).toBeNull()
  })

  // A variable set to spaces is a misconfiguration, not a password: it
  // must not become a credential that " " unlocks.
  it('is null when the variable holds only whitespace', async () => {
    process.env.VAULT_MASTER_PASSWORD = '   '
    expect((await load())()).toBeNull()
  })

  it('returns the configured password', async () => {
    process.env.VAULT_MASTER_PASSWORD = 'hunter2'
    expect((await load())()).toBe('hunter2')
  })

  it('trims surrounding whitespace', async () => {
    process.env.VAULT_MASTER_PASSWORD = '  hunter2\n'
    expect((await load())()).toBe('hunter2')
  })

  it('caches the first answer rather than re-reading the env', async () => {
    process.env.VAULT_MASTER_PASSWORD = 'first'
    const read = await load()
    expect(read()).toBe('first')
    process.env.VAULT_MASTER_PASSWORD = 'second'
    expect(read()).toBe('first')
  })

  it('caches a null answer too', async () => {
    const read = await load()
    expect(read()).toBeNull()
    process.env.VAULT_MASTER_PASSWORD = 'late'
    expect(read()).toBeNull()
  })
})
