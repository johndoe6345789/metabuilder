/**
 * Serve and delete one asset.
 *
 * Reads are open: these are logos and images meant to appear on published
 * pages, which anyone may look at. Deletes are not.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { fetchSession } from '@/lib/auth/api/fetch-session'
import { SESSION_COOKIE } from '@/app/api/auth/session/route'
import { deleteObject, getObject } from '@/lib/object-store/client'

const bucketFor = (tenant: string): string => `tenant-${tenant}`

interface RouteParams {
  params: Promise<{ path: string[] }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { path } = await params
  const tenant = request.nextUrl.searchParams.get('tenant') ?? 'system'
  const object = await getObject(bucketFor(tenant), path.join('/'))
  if (object === null) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return new NextResponse(object.body, {
    headers: {
      'Content-Type': object.contentType,
      // Content-addressed by etag; a changed file is a changed etag.
      'Cache-Control': 'public, max-age=300',
      ETag: object.etag,
      // An uploaded SVG is a script vector; never let one run as a document.
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null
  if (token === null || (await fetchSession(token)) === null) {
    return NextResponse.json(
      { error: 'Sign in to delete assets' },
      { status: 401 }
    )
  }
  const { path } = await params
  const tenant = request.nextUrl.searchParams.get('tenant') ?? 'system'
  await deleteObject(bucketFor(tenant), path.join('/'))
  return NextResponse.json({ ok: true })
}
