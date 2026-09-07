/**
 * The tenant's static assets: list and upload.
 *
 * The object store is not published through nginx, so this is how a browser
 * reaches it. Credentials stay here: the store authenticates with an
 * AWS-style key pair that must never reach a bundle.
 *
 * The tenant comes from the caller, so every operation here checks that
 * the caller owns it -- the same rule the data-layer proxy applies. A
 * session alone is not enough: listing had no check at all, so any visitor
 * could enumerate any community's uploads by editing the query string, and
 * the upload check stopped at "somebody is signed in", which let a founder
 * write into another community's bucket.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { callerAccessTo } from '@/lib/auth/owns-tenant'
import { ensureBucket, listObjects, putObject } from '@/lib/object-store/client'
import { bucketFor, refuseUpload, safeAssetKey } from './upload-policy'

/** 401 for a stranger, 403 for someone else's community, else null. */
async function refuse(tenant: string): Promise<NextResponse | null> {
  const access = await callerAccessTo(tenant)
  if (access === 'anonymous') {
    return NextResponse.json({ error: 'Sign in first' }, { status: 401 })
  }
  if (access === 'forbidden') {
    return NextResponse.json(
      { error: 'That community is not yours' },
      { status: 403 }
    )
  }
  return null
}

/** form.get can hand back a File; only a string is a tenant. */
function tenantFrom(form: FormData): string {
  const field = form.get('tenant')
  return typeof field === 'string' && field !== '' ? field : 'system'
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tenant = request.nextUrl.searchParams.get('tenant') ?? 'system'
  // Reading one object stays open -- that is how an image on a published
  // page loads. Enumerating a whole bucket is not part of rendering one.
  const refusal = await refuse(tenant)
  if (refusal !== null) return refusal
  try {
    const objects = await listObjects(bucketFor(tenant))
    return NextResponse.json({ objects })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'listing failed'
    return NextResponse.json({ objects: [], error: message }, { status: 502 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const form = await request.formData()
  const file = form.get('file')
  const tenant = tenantFrom(form)

  const notYours = await refuse(tenant)
  if (notYours !== null) return notYours

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
