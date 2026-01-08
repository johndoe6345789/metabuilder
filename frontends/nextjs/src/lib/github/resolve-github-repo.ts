/**
 * Resolve GitHub repository
 */

export interface GitHubRepo {
  owner: string
  repo: string
}

export function resolveGitHubRepo(params: URLSearchParams | string): GitHubRepo {
  if (typeof params === 'string') {
    const [owner, repo] = params.split('/')
    return { 
      owner: owner ?? '', 
      repo: repo ?? '' 
    }
  }
  
  const ownerParam = params.get('owner')
  const repoParam = params.get('repo')
  return {
    owner: ownerParam ?? '',
    repo: repoParam ?? '',
  }
}
