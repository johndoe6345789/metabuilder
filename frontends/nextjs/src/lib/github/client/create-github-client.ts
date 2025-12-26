import { Octokit } from 'octokit'

export function createGitHubClient() {
  const token = process.env.GITHUB_TOKEN
  if (token) {
    return new Octokit({ auth: token })
  }
  return new Octokit()
}
