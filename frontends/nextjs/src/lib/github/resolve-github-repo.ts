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
      owner: owner !== '' ? owner : '', 
      repo: repo !== undefined && repo !== '' ? repo : '' 
    }
  }
  
  const ownerParam = params.get('owner')
  const repoParam = params.get('repo')
  return {
    owner: ownerParam !== null && ownerParam !== '' ? ownerParam : '',
    repo: repoParam !== null && repoParam !== '' ? repoParam : '',
  }
}
