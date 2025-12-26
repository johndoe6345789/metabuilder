# API Development Guide

Guide for building and consuming APIs in MetaBuilder.

## API Structure

MetaBuilder uses Next.js API routes for backend endpoints:

```
app/api/
├── users/
│   ├── route.ts           # GET /api/users, POST /api/users
│   └── [id]/
│       └── route.ts       # GET /api/users/[id], PATCH, DELETE
├── workflows/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
└── auth/
    ├── login/route.ts
    ├── register/route.ts
    ├── session/route.ts
    └── logout/route.ts
```

## Users API (DBAL-backed)

The users endpoints run on the server and use DBAL helpers + credential storage.

### Create User

```
POST /api/users
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "role": "admin",
  "password": "s3cret",
  "bio": "Short bio",
  "profilePicture": "https://example.com/avatar.png"
}
```

Response:

```
{
  "user": {
    "id": "user_123",
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "admin",
    "bio": "Short bio",
    "profilePicture": "https://example.com/avatar.png",
    "createdAt": 1715612345678
  }
}
```

### Update User

```
PATCH /api/users/{id}
Content-Type: application/json

{
  "email": "updated@example.com",
  "password": "new-secret"
}
```

### Delete User

```
DELETE /api/users/{id}
```

## Auth API (Session-backed)

Authentication uses a database-backed session with an httpOnly cookie (`mb_session`).
Sessions default to a 7 day TTL and are refreshed on `/api/auth/session`.

### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "alice@example.com",
  "password": "s3cret"
}
```

Response:

```
{
  "user": {
    "id": "user_123",
    "username": "alice",
    "email": "alice@example.com",
    "role": "user",
    "createdAt": 1715612345678
  }
}
```

### Register

```
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "s3cret"
}
```

### Session Check

```
GET /api/auth/session
```

Response:

```
{
  "user": null
}
```

### Logout

```
POST /api/auth/logout
```

## Screenshot Analysis API

Local heuristic analysis for the Screenshot Analyzer UI.

```
POST /api/screenshot/analyze
Content-Type: application/json

{
  "title": "Dashboard",
  "url": "https://example.com/dashboard",
  "viewport": { "width": 1280, "height": 720 },
  "textSample": "First 3k characters of text",
  "htmlSample": "First 6k characters of HTML"
}
```

Response:

```
{
  "report": "Screenshot Analysis (local heuristics)...",
  "metrics": {
    "wordCount": 120,
    "headingCount": 4,
    "h1Count": 1,
    "h2Count": 2,
    "h3Count": 1,
    "imgCount": 3,
    "imgMissingAltCount": 1,
    "linkCount": 12,
    "buttonCount": 4,
    "formCount": 1,
    "inputCount": 3
  },
  "warnings": [
    "Images missing alt text: 1."
  ]
}
```

## Creating an API Endpoint

### 1. Create Route File

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/posts - List user's posts
 * @requires Level 2+
 */
export async function GET(req: NextRequest) {
  try {
    // Validate authentication
    const user = await validateRequest(req)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get posts for user's tenant
    const posts = await prisma.post.findMany({
      where: {
        tenantId: user.tenantId,
        author: { level: { gte: 2 } }, // Level 2+
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('GET /api/posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/posts - Create new post
 * @requires Level 2+
 * @body {{ title: string, content: string }}
 */
export async function POST(req: NextRequest) {
  try {
    const user = await validateRequest(req)
    
    if (!user || user.level < 2) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    const body = await req.json()
    
    // Validate input
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content required' },
        { status: 400 }
      )
    }
    
    // Create post
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: user.id,
        tenantId: user.tenantId,
      },
    })
    
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('POST /api/posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 2. Create Dynamic Route

```typescript
// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequest, canAccessLevel } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/posts/[id] - Get specific post
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await validateRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const post = await prisma.post.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
      include: { author: true },
    })
    
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/posts/[id] - Update post
 * @requires Owner or Level 3+
 */
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await validateRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check ownership or admin
    const post = await prisma.post.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    })
    
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    const isOwner = post.authorId === user.id
    const isAdmin = canAccessLevel(user.level, 3)
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await req.json()
    
    const updated = await prisma.post.update({
      where: { id: params.id },
      data: {
        title: body.title,
        content: body.content,
      },
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/posts/[id] - Delete post
 * @requires Owner or Level 3+
 */
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await validateRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const post = await prisma.post.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    })
    
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    if (post.authorId !== user.id && !canAccessLevel(user.level, 3)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    await prisma.post.delete({ where: { id: params.id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Consuming APIs

### From React Components

```typescript
import { useEffect, useState } from 'react'

export const PostList = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Fetch posts
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts')
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json()
        setPosts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
  }, [])
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### Using Custom Hook

```typescript
// hooks/useFetch.ts
import { useState, useEffect } from 'react'

export const useFetch = <T,>(url: string) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error('API error')
        const json = await response.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [url])
  
  return { data, loading, error }
}

// Usage
const { data: posts } = useFetch('/api/posts')
```

## Error Handling

### Common Status Codes

| Code | Meaning | Handling |
|------|---------|----------|
| 200 | Success | Process data |
| 201 | Created | Show success message |
| 400 | Bad Request | Validate input |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show permission error |
| 404 | Not Found | Show not found message |
| 500 | Server Error | Show error, log issue |

### Consistent Error Response

```typescript
export interface ApiError {
  error: string
  code?: string
  details?: Record<string, string>
}

// Return error
return NextResponse.json(
  {
    error: 'Validation failed',
    code: 'INVALID_INPUT',
    details: {
      title: 'Title is required',
      email: 'Email format invalid',
    },
  },
  { status: 400 }
)
```

## Authentication & Authorization

### Validate Request

```typescript
import { validateRequest } from '@/lib/auth'

const user = await validateRequest(req)

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Check Permission Level

```typescript
import { canAccessLevel } from '@/lib/auth'

if (!canAccessLevel(user.level, 3)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

## Rate Limiting

```typescript
// Simple in-memory rate limiter
const rateLimitMap = new Map<string, number[]>()

function checkRateLimit(userId: string, limit: number = 100): boolean {
  const now = Date.now()
  const oneMinuteAgo = now - 60 * 1000
  
  const timestamps = rateLimitMap.get(userId) || []
  const recent = timestamps.filter(t => t > oneMinuteAgo)
  
  if (recent.length >= limit) {
    return false
  }
  
  recent.push(now)
  rateLimitMap.set(userId, recent)
  return true
}
```

## Testing APIs

```typescript
// __tests__/api/posts.spec.ts
import { GET, POST } from '@/app/api/posts/route'

describe('POST API', () => {
  it('should get posts', async () => {
    const req = new Request('http://localhost/api/posts')
    const response = await GET(req as any)
    
    expect(response.status).toBe(200)
  })
})
```

## Best Practices

✅ **Do:**
- Always validate authentication
- Check permissions on sensitive operations
- Filter data by tenantId
- Use TypeScript for request/response types
- Document endpoints with JSDoc
- Handle errors consistently
- Validate input before processing
- Use appropriate HTTP status codes

❌ **Don't:**
- Trust user input without validation
- Forget tenantId in queries
- Return sensitive data in error messages
- Mix multiple resources in one endpoint
- Skip error handling
- Use GET for data modification
- Expose database errors to client

See related guides in `/docs/` for more patterns.
