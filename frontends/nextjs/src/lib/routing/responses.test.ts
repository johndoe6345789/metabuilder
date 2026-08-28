import { describe, expect, it } from 'vitest'

import { STATUS, errorResponse, successResponse } from '@/lib/routing'

describe('STATUS', () => {
  it('names the codes the API routes use', () => {
    expect(STATUS.OK).toBe(200)
    expect(STATUS.CREATED).toBe(201)
    expect(STATUS.BAD_REQUEST).toBe(400)
    expect(STATUS.UNAUTHORIZED).toBe(401)
    expect(STATUS.FORBIDDEN).toBe(403)
    expect(STATUS.NOT_FOUND).toBe(404)
  })

  it('keeps ERROR and INTERNAL_ERROR the same code', () => {
    // Both names are in use across the routes; they must not drift.
    expect(STATUS.ERROR).toBe(500)
    expect(STATUS.INTERNAL_ERROR).toBe(500)
  })
})

describe('successResponse', () => {
  it('defaults to 200 and returns the payload as JSON', async () => {
    const res = successResponse({ id: 7 })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ id: 7 })
  })

  it('takes an explicit status, such as 201', () => {
    expect(successResponse({}, STATUS.CREATED).status).toBe(201)
  })

  it('passes through a null payload rather than emptying the body', async () => {
    await expect(successResponse(null).json()).resolves.toBeNull()
  })
})

describe('errorResponse', () => {
  it('defaults to 500 and puts the message under `error`', async () => {
    const res = errorResponse('boom')

    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({ error: 'boom' })
  })

  it('takes an explicit status, such as 404', () => {
    expect(errorResponse('missing', STATUS.NOT_FOUND).status).toBe(404)
  })
})
