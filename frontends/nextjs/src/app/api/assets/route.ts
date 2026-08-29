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
import { ensureBucket, listObjects, putObject } from '@/lib/object-store/client'
import { bucketFor, refuseUpload, safeAssetKey } from './upload-policy'

async function signedIn(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? null
  if (token === null) return false
  return (await fetchSession(token)) !== null
}

/** form.get can hand back a File; only a string is a tenant. */
function tenantFrom(form: FormData): string {
  const field = form.get('tenant')
  return typeof field === 'string' && field !== '' ? field : 'system'
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
  const tenant = tenantFrom(form)
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file supplied' }, { status: 400 })
  }

  const refusal = refuseUpload(file)
  if (refusal !== null) {
    return NextResponse.json(
      { error: refusal.error },
      { status: refusal.status }
    )
  }

  const name = safeAssetKey(file.name)
  const bucket = bucketFor(tenant)
  try {
    await ensureBucket(bucket)
    await putObject(bucket, name, await file.arrayBuffer(), file.type)
    return NextResponse.json({
      key: name,
      url: `/app/api/assets/${name}?tenant=${tenant}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'upload failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
