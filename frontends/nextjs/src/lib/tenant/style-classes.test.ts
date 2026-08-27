import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  loadStyleClasses,
  saveStyleClasses,
  styleSheetText,
  toCssProp,
  toCssText,
} from '@/lib/tenant/style-classes'

const DBAL = 'http://dbal.test'

/** The envelope DBAL wraps every list in. */
const rows = (data: unknown[]): Response =>
  new Response(JSON.stringify({ data: { data } }), { status: 200 })

interface Call {
  url: string
  method: string
  body: unknown
}

/**
 * A stand-in for the data layer that records what was asked of it.
 *
 * The publish path has never run against the real thing -- it needs a god
 * login -- and the last bug in this area was exactly a wrong assumption about
 * the API shape, so what these assert is the requests, not just the return.
 */
function stubDbal(responder: (url: string, init?: RequestInit) => Response) {
  const calls: Call[] = []
  vi.stubGlobal('fetch', (url: string, init?: RequestInit) => {
    calls.push({
      url,
      method: init?.method ?? 'GET',
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
    })
    return Promise.resolve(responder(url, init))
  })
  return calls
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('style class CSS', () => {
  it('normalises React casing to real CSS property names', () => {
    expect(toCssProp('borderRadius')).toBe('border-radius')
    expect(toCssProp('color')).toBe('color')
    // Custom properties are already correct and must not be mangled.
    expect(toCssProp('--brand')).toBe('--brand')
  })

  it('strips characters that could end a rule early', () => {
    const css = toCssText({ color: 'red} body {display:none' })
    expect(css).not.toContain('}')
    expect(css).toContain('color:')
  })

  it('skips classes with no declarations and unsafe names', () => {
    const sheet = styleSheetText([
      { id: 'a', name: 'lede', props: { color: '#c00' } },
      { id: 'b', name: 'empty', props: {} },
      { id: 'c', name: 'bad name', props: { color: 'red' } },
    ])
    // Doubled on purpose: a single class ties with the component libraries'
    // own styles and loses on order.
    expect(sheet).toContain('.lede.lede {')
    expect(sheet).not.toContain('empty')
    expect(sheet).not.toContain('bad name')
  })
})

describe('loadStyleClasses', () => {
  it('joins rules to their declarations and keeps author order', async () => {
    stubDbal(url =>
      url.includes('StyleRuleProp')
        ? rows([
            { ruleId: 'r2', name: 'color', value: '#c00' },
            { ruleId: 'r1', name: 'font-size', value: '2rem' },
          ])
        : rows([
            { id: 'r2', ruleKey: 'k2', name: 'second', sortOrder: 1 },
            { id: 'r1', ruleKey: 'k1', name: 'first', sortOrder: 0 },
          ])
    )

    const classes = await loadStyleClasses(DBAL, 'system')

    expect(classes.map(c => c.name)).toEqual(['first', 'second'])
    expect(classes[0]?.props).toEqual({ 'font-size': '2rem' })
    expect(classes[1]?.props).toEqual({ color: '#c00' })
  })

  it('reports no classes rather than throwing when the layer is down', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new Error('ECONNREFUSED')))
    await expect(loadStyleClasses(DBAL, 'system')).resolves.toEqual([])
  })
})

describe('saveStyleClasses', () => {
  it('writes rules and declarations in batches, not one request each', async () => {
    // Deliberately empty bodies: publishing must not depend on anything in
    // the create response, because nothing verifies its shape.
    const calls = stubDbal(() => new Response('', { status: 200 }))

    const ok = await saveStyleClasses(DBAL, 'system', [
      { id: 'k1', name: 'lede', props: { color: '#c00', 'font-size': '2rem' } },
    ])
    expect(ok).toBe(true)

    // The old sheet is deleted first, so a republish replaces rather than merges.
    expect(calls[0]).toMatchObject({
      method: 'DELETE',
      url: `${DBAL}/system/core/StyleClass/styles_system`,
    })

    const posted = calls.filter(c => c.method === 'POST')
    expect(posted[0]?.url).toBe(`${DBAL}/system/core/StyleClass`)

    // The data layer allows 50 mutations a minute, and a sheet is naturally
    // many small rows, so these go in one batch each rather than per row.
    const ruleBatch = posted.find(c => c.url.endsWith('/StyleRule/_bulk/create'))
    const propBatch = posted.find(c => c.url.endsWith('/StyleRuleProp/_bulk/create'))
    expect(ruleBatch).toBeDefined()
    expect(propBatch).toBeDefined()
    expect(posted).toHaveLength(3)

    const rules = ruleBatch?.body as { id: string; name: string }[]
    const props = propBatch?.body as { ruleId: string }[]
    expect(rules).toHaveLength(1)
    expect(rules[0]?.id).toBe('styles_system__k1')
    expect(props).toHaveLength(2)
    expect(props.every(p => p.ruleId === 'styles_system__k1')).toBe(true)
  })

  it('reports failure when the layer rejects a write', async () => {
    stubDbal(url =>
      url.endsWith('/StyleClass') && !url.includes('styles_system')
        ? new Response('nope', { status: 500 })
        : new Response('{}', { status: 200 })
    )
    await expect(
      saveStyleClasses(DBAL, 'system', [{ id: 'k', name: 'x', props: {} }])
    ).resolves.toBe(false)
  })
})

describe('rate limiting', () => {
  it('retries a batch the limiter rejected rather than losing the sheet', async () => {
    vi.useFakeTimers()
    let attempts = 0
    stubDbal(url => {
      if (!url.includes('_bulk/create')) return new Response('', { status: 200 })
      attempts += 1
      // 50 mutations a minute; a real sheet exceeds it, and a publish that
      // gives up here loses two thirds of the styles with nothing to show.
      return attempts === 1
        ? new Response('rate limited', { status: 429 })
        : new Response('', { status: 200 })
    })

    const saved = saveStyleClasses(DBAL, 'system', [
      { id: 'k', name: 'lede', props: { color: 'red' } },
    ])
    await vi.advanceTimersByTimeAsync(25_000)
    await expect(saved).resolves.toBe(true)
    expect(attempts).toBeGreaterThan(1)
    vi.useRealTimers()
  })

  it('gives up rather than retrying forever', async () => {
    vi.useFakeTimers()
    stubDbal(url =>
      url.includes('_bulk/create')
        ? new Response('rate limited', { status: 429 })
        : new Response('', { status: 200 })
    )
    const saved = saveStyleClasses(DBAL, 'system', [
      { id: 'k', name: 'lede', props: { color: 'red' } },
    ])
    await vi.advanceTimersByTimeAsync(200_000)
    await expect(saved).resolves.toBe(false)
    vi.useRealTimers()
  })
})
