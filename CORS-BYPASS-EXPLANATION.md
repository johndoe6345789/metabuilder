# CORS Bypass - Why It's Not Possible & The Solution

## The Problem

You encountered this error:
```
Access to fetch at 'https://github.com/johndoe6345789/metabuilder/actions' from origin 'https://supreme-space-xylophone-697v74xg4554hjrr-5000.app.github.dev' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Why You Can't Bypass CORS

**CORS (Cross-Origin Resource Sharing) is a browser security feature, not a server limitation.**

1. **Browser Enforcement**: CORS is enforced by the browser, not your code. Even if you try:
   - Setting special headers
   - Using different fetch options
   - Proxying through your own server (in a browser-only environment)
   - Any other client-side trick

   The browser will still block the request before it even reaches GitHub's servers.

2. **GitHub's Policy**: GitHub intentionally does NOT set `Access-Control-Allow-Origin` headers on their HTML pages because they don't want random websites scraping their content.

## The Solutions (In Order of Preference)

### ✅ Solution 1: Use GitHub's Official API (IMPLEMENTED)

Instead of scraping the HTML page, use GitHub's REST API:

```typescript
import { Octokit } from 'octokit'

const octokit = new Octokit()

const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
  owner: 'johndoe6345789',
  repo: 'metabuilder',
  per_page: 20
})
```

**Advantages:**
- No CORS issues
- Structured JSON data (not HTML)
- Official, supported by GitHub
- Rate limits: 60 requests/hour (unauthenticated) or 5,000/hour (authenticated)
- Can be authenticated with the current GitHub user via `spark.user()`

**This is what we implemented in `GitHubActionsFetcher.tsx`**

### ⚠️ Solution 2: Server-Side Proxy (Not Available in Spark)

If you needed the HTML content specifically, you'd need a backend server:

```typescript
// Backend (Node.js/Express)
app.get('/api/github-proxy', async (req, res) => {
  const response = await fetch('https://github.com/...')
  const html = await response.text()
  res.set('Access-Control-Allow-Origin', '*')
  res.send(html)
})
```

**Why this doesn't work in Spark:**
- Spark apps are frontend-only (no backend server)
- The proxy would need to run on a different origin

### ❌ Solution 3: Browser Extensions (Not Practical)

You could install a browser extension that disables CORS, but:
- Only works for you, not your users
- Major security risk
- Not a real solution

## What We Built

The `GitHubActionsFetcher` component now:

1. ✅ Uses GitHub's official REST API via Octokit
2. ✅ Fetches workflow runs data (not HTML)
3. ✅ Displays structured, formatted workflow information
4. ✅ Shows status, conclusion, branch, event type
5. ✅ Provides direct links to each workflow run
6. ✅ Allows copying all data as JSON
7. ✅ No CORS issues

## API Endpoints Available

GitHub's API provides many useful endpoints:

- `GET /repos/{owner}/{repo}/actions/runs` - List workflow runs
- `GET /repos/{owner}/{repo}/actions/workflows` - List workflows
- `GET /repos/{owner}/{repo}/actions/runs/{run_id}` - Get a specific run
- `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs` - Get jobs for a run
- `GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs` - Download logs

See: https://docs.github.com/en/rest/actions

## Summary

**CORS cannot be bypassed from client-side code.** The proper solution is to use APIs that are designed to be accessed from browsers - like GitHub's REST API. The component now works perfectly and provides even better data than scraping HTML would have given you.
