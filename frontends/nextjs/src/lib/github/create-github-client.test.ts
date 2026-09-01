import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Octokit } from 'octokit'
import { createGitHubClient } from './create-github-client'

describe('createGitHubClient', () => {
  const originalToken = process.env.GITHUB_TOKEN

  beforeEach(() => {
    delete process.env.GITHUB_TOKEN
  })

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.GITHUB_TOKEN
    } else {
      process.env.GITHUB_TOKEN = originalToken
    }
  })

  it('uses the explicit token parameter when provided', () => {
    const client = createGitHubClient('explicit-token')
    expect(client).toBeInstanceOf(Octokit)
  })

  it('falls back to the GITHUB_TOKEN environment variable', () => {
    process.env.GITHUB_TOKEN = 'env-token'
    const client = createGitHubClient()
    expect(client).toBeInstanceOf(Octokit)
  })

  it('throws when no token is available', () => {
    expect(() => createGitHubClient()).toThrow(
      'GitHub token is required. Provide a token parameter or set ' +
        'GITHUB_TOKEN environment variable.'
    )
  })

  it('does not require GITHUB_TOKEN when an explicit token is given', () => {
    // beforeEach already deleted GITHUB_TOKEN -- this proves the explicit
    // parameter alone is sufficient and the env var is never required.
    expect(() => createGitHubClient('explicit-token')).not.toThrow()
  })
})
