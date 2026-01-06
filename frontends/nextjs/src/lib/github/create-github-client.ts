/**
 * Create GitHub client using Octokit
 */

import { Octokit } from 'octokit'

export type GitHubClient = Octokit

export function createGitHubClient(token?: string): GitHubClient {
  return new Octokit({
    auth: token || process.env.GITHUB_TOKEN,
  })
}
