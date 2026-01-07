/**
 * Create GitHub client using Octokit
 */

import { Octokit } from 'octokit'

export type GitHubClient = Octokit

export function createGitHubClient(token?: string): GitHubClient {
  const authToken = token ?? process.env.GITHUB_TOKEN
  
  if (!authToken) {
    throw new Error('GitHub token is required. Provide a token parameter or set GITHUB_TOKEN environment variable.')
  }

  return new Octokit({
    auth: authToken,
  })
}
