import { afterEach, describe, expect, it, vi } from 'vitest'

import { submitForm } from './submit-form'

const request = {
  tenant: 'harbour_cycle_works',
  formName: 'book-a-repair',
  path: '/book',
  values: { name: 'Rosa', bicycle: 'Touring, rear wheel buckled' },
}

const stub = (status: number) => {
  const calls: { url: string; body: Record<string, unknown> }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      calls.push({
        url,
        body: JSON.parse(String(init.body)) as Record<string, unknown>,
      })
      return { ok: status >= 200 && status < 300, status }
    })
  )
  return calls
}

afterEach(() => vi.unstubAllGlobals())

describe('submitForm', () => {
  it("writes the row under the site's own tenant", async () => {
    const calls = stub(201)

    await submitForm(request)

    expect(calls[0]?.url).toContain(
      '/harbour_cycle_works/core/FormSubmission'
    )
    expect(calls[0]?.body.tenantId).toBe('harbour_cycle_works')
  })

  it('sends the answers, the form name and the page', async () => {
    const calls = stub(201)

    await submitForm(request)

    expect(calls[0]?.body.data).toEqual(request.values)
    expect(calls[0]?.body.formName).toBe('book-a-repair')
    expect(calls[0]?.body.path).toBe('/book')
  })

  /**
   * `status` is privileged, so DBAL refuses an anonymous write that sets
   * it -- the whole submission would fail, not just that field.
   */
  it('does not try to set a field a visitor may not set', async () => {
    const calls = stub(201)

    await submitForm(request)

    expect(calls[0]?.body).not.toHaveProperty('status')
  })

  it('reports success', async () => {
    stub(201)
    expect(await submitForm(request)).toEqual({ ok: true, reason: null })
  })

  // Without a tenant the row lands in whatever DBAL defaults to, which is
  // someone else's data.
  it('refuses to guess a tenant', async () => {
    const calls = stub(201)

    const result = await submitForm({ ...request, tenant: '' })

    expect(result.ok).toBe(false)
    expect(calls).toHaveLength(0)
  })

  it('says to try again shortly when rate limited', async () => {
    stub(429)
    const result = await submitForm(request)
    expect(result.reason).toContain('try again shortly')
  })

  it('reports the status when the write is refused', async () => {
    stub(422)
    expect((await submitForm(request)).reason).toContain('422')
  })

  // A visitor cannot act on a stack trace; they can act on "try again".
  it('gives a plain reason when the site cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('ECONNREFUSED') }))
    const result = await submitForm(request)
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('Could not reach the site. Please try again.')
  })
})
