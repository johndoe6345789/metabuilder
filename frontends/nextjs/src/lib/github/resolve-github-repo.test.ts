import { describe, expect, it } from 'vitest'
import { resolveGitHubRepo } from './resolve-github-repo'

describe('resolveGitHubRepo', () => {
  it('reads owner/repo from a "owner/repo" string', () => {
    expect(resolveGitHubRepo('acme/widgets')).toEqual({
      owner: 'acme',
      repo: 'widgets',
    })
  })

  it('defaults repo to empty when the string has no slash', () => {
    expect(resolveGitHubRepo('acme')).toEqual({ owner: 'acme', repo: '' })
  })

  it('reads owner/repo from URLSearchParams', () => {
    const params = new URLSearchParams({ owner: 'acme', repo: 'widgets' })
    expect(resolveGitHubRepo(params)).toEqual({
      owner: 'acme',
      repo: 'widgets',
    })
  })

  it('defaults both to empty when URLSearchParams has neither', () => {
    expect(resolveGitHubRepo(new URLSearchParams())).toEqual({
      owner: '',
      repo: '',
    })
  })
})
