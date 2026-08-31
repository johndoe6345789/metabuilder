/**
 * RESTful Multi-Tenant API Route
 *
 * Pattern: /api/v1/{tenant}/{package}/{entity}[/{id}[/{action}]]
 *
 * Examples:
 *   GET  /api/v1/acme/forum_forge/posts           -> list posts
 *   GET  /api/v1/acme/forum_forge/posts/123       -> read post 123
 *   POST /api/v1/acme/forum_forge/posts           -> create post
 *   PUT  /api/v1/acme/forum_forge/posts/123       -> update post 123
 *   DELETE /api/v1/acme/forum_forge/posts/123     -> delete post 123
 *   POST /api/v1/acme/forum_forge/posts/123/like  -> custom action
 *
 * Authentication & Authorization:
 *   - Session validated from the caller's DBAL OIDC bearer token
 *   - Tenant access validated (user must belong to tenant or be God+)
 *   - Package minLevel checked against user level
 *   - Entity must be declared in package schema
 */

import type { NextRequest } from 'next/server'
import {
  handleRequest,
  type RouteParams,
} from './slug-route/handle-request'

export async function GET(request: NextRequest, params: RouteParams) {
  return handleRequest(request, params)
}

export async function POST(request: NextRequest, params: RouteParams) {
  return handleRequest(request, params)
}

export async function PUT(request: NextRequest, params: RouteParams) {
  return handleRequest(request, params)
}

export async function PATCH(request: NextRequest, params: RouteParams) {
  return handleRequest(request, params)
}

export async function DELETE(request: NextRequest, params: RouteParams) {
  return handleRequest(request, params)
}
