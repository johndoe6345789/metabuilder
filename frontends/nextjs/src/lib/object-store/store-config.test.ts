import { describe, expect, it } from 'vitest'

import { DEV_ACCESS_KEY, getStoreConfig } from './store-config'

describe('getStoreConfig', () => {
  it('uses the explicit key pair and normalises the endpoint', () => {
    const cfg = getStoreConfig({
      NODE_ENV: 'production',
      OBJECT_STORE_URL: 'http://object-store:9000/',
      OBJECT_STORE_ACCESS_KEY: 'ak',
      OBJECT_STORE_SECRET_KEY: 'sk',
      OBJECT_STORE_REGION: 'eu-west-1',
    })
    expect(cfg).toEqual({
      endpoint: 'http://object-store:9000',
      region: 'eu-west-1',
      accessKey: 'ak',
      secretKey: 'sk',
    })
  })

  it('refuses to run in production without credentials', () => {
    expect(() => getStoreConfig({ NODE_ENV: 'production' })).toThrow(
      'OBJECT_STORE_ACCESS_KEY'
    )
    expect(() =>
      getStoreConfig({ NODE_ENV: 'production', OBJECT_STORE_ACCESS_KEY: 'a' })
    ).toThrow('OBJECT_STORE_SECRET_KEY')
  })

  it('falls back to the named dev placeholders outside production', () => {
    const cfg = getStoreConfig({ NODE_ENV: 'development' })
    expect(cfg.accessKey).toBe(DEV_ACCESS_KEY)
    expect(cfg.accessKey).not.toContain('minioadmin')
    expect(cfg.region).toBe('us-east-1')
    expect(cfg.endpoint).toBe('http://localhost:9000')
  })
})
