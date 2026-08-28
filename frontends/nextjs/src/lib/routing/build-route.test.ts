import { describe, expect, it } from 'vitest'

import { buildRoute } from '@/lib/routing'

describe('buildRoute', () => {
  it('fills brace placeholders', () => {
    expect(
      buildRoute('/{tenant}/core/{entity}', {
        tenant: 'system',
        entity: 'User',
      })
    ).toBe('/system/core/User')
  })

  it('fills colon placeholders', () => {
    expect(buildRoute('/:tenant/core', { tenant: 'system' })).toBe(
      '/system/core'
    )
  })

  it('prefers the brace form when a template somehow has both', () => {
    expect(buildRoute('/{id}/:id', { id: '7' })).toBe('/7/:id')
  })

  it('leaves a placeholder with no matching value in place', () => {
    // Better a visible {missing} than a silently truncated path.
    expect(buildRoute('/{a}/{missing}', { a: '1' })).toBe('/1/{missing}')
  })

  it('ignores values the template does not mention', () => {
    expect(buildRoute('/{a}', { a: '1', unused: '2' })).toBe('/1')
  })

  it('replaces only the first occurrence of a repeated placeholder', () => {
    expect(buildRoute('/{a}/{a}', { a: '1' })).toBe('/1/{a}')
  })

  it('returns a template with no placeholders unchanged', () => {
    expect(buildRoute('/health', { a: '1' })).toBe('/health')
  })
})
