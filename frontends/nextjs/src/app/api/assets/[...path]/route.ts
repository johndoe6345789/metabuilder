/**
 * Serve and delete one asset.
 *
 * Reading one object is open: these are logos and images meant to appear
 * on published pages, which anyone may look at. Deleting is not, and being
 * signed in is not enough -- the tenant comes from the query string, so it
 * has to be one the caller owns.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { callerAccessTo } from '@/lib/auth/owns-tenant'
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
      'Content-Security-Policy':
        "default-src 'none'; style-src 'unsafe-inline'",
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { path } = await params
  const tenant = request.nextUrl.searchParams.get('tenant') ?? 'system'
  // Being signed in was the whole check, so one founder could delete the
  // logos and images off another community's live pages.
  const access = await callerAccessTo(tenant)
  if (access === 'anonymous') {
    return NextResponse.json(
      { error: 'Sign in to delete assets' },
      { status: 401 }
    )
  }
  if (access === 'forbidden') {
    return NextResponse.json(
      { error: 'That community is not yours' },
      { status: 403 }
    )
  }
  await deleteObject(bucketFor(tenant), path.join('/'))
  return NextResponse.json({ ok: true })
}
