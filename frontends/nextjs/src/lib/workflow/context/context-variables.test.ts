import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  buildVariables,
  stripCrossTenantVariables,
} from './context-variables'

const request = { tenantId: 'acme', userId: 'u1', userLevel: 2 }

const workflow = (variables: Record<string, unknown>) =>
  ({ variables }) as never

afterEach(() => vi.restoreAllMocks())

describe('buildVariables', () => {
  it('seeds the workflow defaults', () => {
    const vars = buildVariables(
      workflow({ retries: { scope: 'workflow', defaultValue: 3 } }),
      request
    )
    expect(vars.retries).toBe(3)
  })

  it('uses null for a default the workflow did not state', () => {
    const vars = buildVariables(
      workflow({ retries: { scope: 'workflow' } }),
      request
    )
    expect(vars.retries).toBeNull()
  })

  // A global-scope variable would outlive the run and cross tenants with
  // it, so it never enters the context at all.
  it('drops a global-scope variable and says so', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const vars = buildVariables(
      workflow({ shared: { scope: 'global', defaultValue: 'x' } }),
      request
    )
    expect(vars.shared).toBeUndefined()
    expect(warn.mock.calls[0]?.[0]).toContain('global-scope')
  })

  it('lets the request override a declared variable', () => {
    const vars = buildVariables(
      workflow({ retries: { scope: 'workflow', defaultValue: 3 } }),
      request,
      { retries: 9 }
    )
    expect(vars.retries).toBe(9)
  })

  // The request cannot introduce a variable the workflow never declared;
  // otherwise a caller writes arbitrary names into the run's scope.
  it('rejects a variable the workflow does not declare', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const vars = buildVariables(workflow({}), request, { injected: 'evil' })
    expect(vars.injected).toBeUndefined()
    expect(warn.mock.calls[0]?.[0]).toContain('Rejecting unknown variable')
  })

  it('injects the tenant, user and level under reserved names', () => {
    expect(buildVariables(workflow({}), request)).toMatchObject({
      _tenantId: 'acme',
      _userId: 'u1',
      _userLevel: 2,
    })
  })

  // The reserved names win: a workflow cannot declare `_tenantId` and
  // have its own value survive into the run.
  it('overwrites a declared variable that shadows a reserved name', () => {
    const vars = buildVariables(
      workflow({ _tenantId: { scope: 'workflow', defaultValue: 'other' } }),
      request,
      { _tenantId: 'other' }
    )
    expect(vars._tenantId).toBe('acme')
  })
})

describe('stripCrossTenantVariables', () => {
  it('blanks a value carrying another tenant id', () => {
    const vars = { row: { _tenantId: 'other', secret: 1 } }
    expect(stripCrossTenantVariables(vars, 'acme').row).toBeNull()
  })

  it('keeps a value from this tenant', () => {
    const row = { _tenantId: 'acme', ok: 1 }
    expect(stripCrossTenantVariables({ row }, 'acme').row).toEqual(row)
  })

  it('keeps values that carry no tenant at all', () => {
    const vars = { plain: { a: 1 }, text: 'x', num: 5, empty: null }
    expect(stripCrossTenantVariables({ ...vars }, 'acme')).toEqual(vars)
  })

  it('blanks only the offending variable', () => {
    const vars = {
      mine: { _tenantId: 'acme' },
      theirs: { _tenantId: 'other' },
    }
    const out = stripCrossTenantVariables(vars, 'acme')
    expect(out.mine).not.toBeNull()
    expect(out.theirs).toBeNull()
  })
})
