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
    return { owner: owner || '', repo: repo || '' }
  }
  
  return {
    owner: params.get('owner') || '',
    repo: params.get('repo') || '',
  }
}
