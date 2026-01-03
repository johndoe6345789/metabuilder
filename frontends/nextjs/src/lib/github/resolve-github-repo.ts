// TODO: Implement GitHub repo resolution
export const resolveGitHubRepo = (url?: string) => ({ 
  owner: url?.split('/')[0] || '', 
  repo: url?.split('/')[1] || '' 
})
