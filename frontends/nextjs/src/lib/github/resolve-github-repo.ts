/**
 * Resolve GitHub repository (stub)
 */

export interface GitHubRepo {
  owner: string
  repo: string
}

export function resolveGitHubRepo(identifier: string): GitHubRepo {
  // TODO: Implement repo resolution
  const [owner, repo] = identifier.split('/')
  return { owner: owner || '', repo: repo || '' }
}
