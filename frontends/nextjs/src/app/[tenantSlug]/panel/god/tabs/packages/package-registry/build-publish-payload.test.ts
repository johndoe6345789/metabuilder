import { describe, it, expect } from 'vitest'
import { buildPublishPayload } from './build-publish-payload'
import { testPackage } from './test-fixtures'

const pkg = testPackage

describe('buildPublishPayload', () => {
  it('sends null for a blank description rather than an empty string', () => {
    expect(buildPublishPayload(pkg(), 'acme').description).toBeNull()
  })

  it('keeps a real description', () => {
    const p = pkg({ manifest: { ...pkg().manifest, description: 'Chat' } })
    expect(buildPublishPayload(p, 'acme').description).toBe('Chat')
  })

  it('flattens reference lists to bare id arrays', () => {
    const p = pkg({
      workflows: [{ id: 'wf1', label: 'Workflow 1' }],
      pageConfigs: [{ id: 'pc1', label: 'Page 1' }],
    })
    const payload = buildPublishPayload(p, 'acme')

    expect(JSON.parse(payload.workflowIds)).toEqual(['wf1'])
    expect(JSON.parse(payload.pageConfigIds)).toEqual(['pc1'])
  })

  it('sends sortOrder and isPublished explicitly', () => {
    const payload = buildPublishPayload(pkg(), 'acme')

    expect(payload.sortOrder).toBe(0)
    expect(payload.isPublished).toBe(true)
  })

  it('carries the tenant through as tenantId', () => {
    expect(buildPublishPayload(pkg(), 'acme').tenantId).toBe('acme')
  })
})
