import { describe, expect, it } from 'vitest'
import { DELETE as deleteHandler } from './handlers/delete-package-data'
import { GET as getHandler } from './handlers/get-package-data'
import { PUT as putHandler } from './handlers/put-package-data'
import { DELETE, dynamic, GET, PUT } from './route'

describe('/api/packages/data/[packageId] route', () => {
  it('opts out of static optimization', () => {
    expect(dynamic).toBe('force-dynamic')
  })

  it('re-exports the GET, PUT, and DELETE handlers unchanged', () => {
    expect(GET).toBe(getHandler)
    expect(PUT).toBe(putHandler)
    expect(DELETE).toBe(deleteHandler)
  })
})
