/**
 * The tenant's static assets: list and upload.
 *
 * The object store is not published through nginx, so this is how a browser
 * reaches it. Credentials stay here: the store authenticates with an
 * AWS-style key pair that must never reach a bundle.
 *
 * Writes require a signed-in caller, the same rule the data-layer proxy
 * applies -- an open upload endpoint is a free file host.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { fetchSession } from '@/lib/auth/api/fetch-session'
import { SESSION_COOKIE } from '@/app/api/auth/session/route'
import {
  ensureBucket,
  listObjects,
  putObject,
} from '@/lib/object-store/client'

/** One bucket per tenant, so a tenant's assets cannot name-collide. */
const bucketFor = (tenant: string): string => `tenant-${tenant}`

/** What a browser may be handed, and nothing executable. */
const ALLOWED = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
  'image/x-icon', 'application/pdf',
])
const MAX_BYTES = 8 * 1024 * 1024

async function signedIn(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null
  if (token === null) return false
  return (await fetchSession(token)) !== null
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tenant = request.nextUrl.searchParams.get('tenant') ?? 'system'
  try {
    const objects = await listObjects(bucketFor(tenant))
    return NextResponse.json({ objects })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'listing failed'
    return NextResponse.json({ objects: [], error: message }, { status: 502 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await signedIn())) {
    return NextResponse.json(
      { error: 'Sign in to upload assets' },
      { status: 401 }
    )
  }

  const form = await request.formData()
  const file = form.get('file')
  // form.get can hand back a File; only a string is a tenant.
  const field = form.get('tenant')
  const tenant = typeof field === 'string' && field !== '' ? field : 'system'
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file supplied' }, { status: 400 })
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: `${file.type || 'That file type'} is not allowed` },
      { status: 415 }
    )
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'Files must be 8MB or smaller' },
      { status: 413 }
    )
  }

  // Keep the author's filename -- it is how they will recognise it in the
  // list -- but only the parts of it that are safe in a URL path.
  const name = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+/, '')
  const bucket = bucketFor(tenant)
  try {
    await ensureBucket(bucket)
    await putObject(bucket, name, await file.arrayBuffer(), file.type)
    return NextResponse.json({ key: name, url: `/app/api/assets/${name}?tenant=${tenant}` })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'upload failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
