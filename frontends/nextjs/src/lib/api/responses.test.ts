import { describe, expect, it } from 'vitest'

import {
  Errors,
  errorResponse,
  HTTP_STATUS,
  successResponse,
} from './responses'

const read = async (res: Response): Promise<Record<string, unknown>> =>
  (await res.json()) as Record<string, unknown>

describe('successResponse', () => {
  it('wraps the data and marks the call a success', async () => {
    const res = successResponse({ id: 1 })
    expect(res.status).toBe(HTTP_STATUS.OK)
    expect(await read(res)).toEqual({ success: true, data: { id: 1 } })
  })

  it('takes the status it was given', () => {
    expect(successResponse({}, HTTP_STATUS.CREATED).status).toBe(201)
  })

  it('includes meta when there is some', async () => {
    const body = await read(successResponse([], HTTP_STATUS.OK, { total: 9 }))
    expect(body.meta).toEqual({ total: 9 })
  })

  // An absent meta block is left out rather than sent as undefined, so a
  // caller can test for its presence.
  it('omits meta entirely when there is none', async () => {
    expect('meta' in (await read(successResponse([])))).toBe(false)
  })

  it('carries a null payload through', async () => {
    expect(await read(successResponse(null))).toEqual({
      success: true,
      data: null,
    })
  })
})

describe('errorResponse', () => {
  it('marks the call a failure and names the code', async () => {
    const res = errorResponse('NOPE', 'no', HTTP_STATUS.BAD_REQUEST)
    expect(res.status).toBe(400)
    expect(await read(res)).toEqual({
      success: false,
      error: { code: 'NOPE', message: 'no' },
    })
  })

  it('defaults to an internal error', () => {
    expect(errorResponse('X', 'y').status).toBe(HTTP_STATUS.INTERNAL_ERROR)
  })

  it('includes details when there are some', async () => {
    const body = await read(
      errorResponse('X', 'y', HTTP_STATUS.BAD_REQUEST, { field: 'name' })
    )
    expect((body.error as Record<string, unknown>).details).toEqual({
      field: 'name',
    })
  })

  it('omits details entirely when there are none', async () => {
    const body = await read(errorResponse('X', 'y'))
    expect('details' in (body.error as Record<string, unknown>)).toBe(false)
  })
})

describe('Errors', () => {
  it.each([
    ['unauthorized', Errors.unauthorized, 401, 'UNAUTHORIZED'],
    ['forbidden', Errors.forbidden, 403, 'FORBIDDEN'],
    ['conflict', () => Errors.conflict('clash'), 409, 'CONFLICT'],
    ['internal', Errors.internal, 500, 'INTERNAL_ERROR'],
    ['badRequest', () => Errors.badRequest('bad'), 400, 'BAD_REQUEST'],
    ['notFound', () => Errors.notFound(), 404, 'NOT_FOUND'],
    [
      'validationError',
      () => Errors.validationError([]),
      422,
      'VALIDATION_ERROR',
    ],
  ])('%s answers %i with %s', async (_name, make, status, code) => {
    const res = make()
    expect(res.status).toBe(status)
    const body = await read(res)
    expect((body.error as Record<string, unknown>).code).toBe(code)
  })

  it('names the missing resource', async () => {
    const body = await read(Errors.notFound('Workflow'))
    expect((body.error as Record<string, unknown>).message).toBe(
      'Workflow not found'
    )
  })

  it('has a default message for each one that takes none', async () => {
    const defaults = [
      Errors.unauthorized(),
      Errors.forbidden(),
      Errors.internal(),
    ]
    for (const res of defaults) {
      const body = await read(res)
      const message = (body.error as Record<string, string>).message
      expect(message.length).toBeGreaterThan(0)
    }
  })

  it('carries the caller\'s own message when given one', async () => {
    const body = await read(Errors.unauthorized('Sign in first'))
    expect((body.error as Record<string, unknown>).message).toBe(
      'Sign in first'
    )
  })

  it('attaches the validation detail it was handed', async () => {
    const body = await read(Errors.validationError({ issues: ['name'] }))
    expect((body.error as Record<string, unknown>).details).toEqual({
      issues: ['name'],
    })
  })
})
