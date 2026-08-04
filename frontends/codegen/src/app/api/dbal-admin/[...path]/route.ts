import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCaller } from '@/lib/adminAuth'

const DBAL_DAEMON_URL = process.env.DBAL_DAEMON_URL ?? 'http://dbal:8080'

async function proxy(request: NextRequest, path: string[]) {
  const auth = await verifyAdminCaller(request)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const url = `${DBAL_DAEMON_URL}/admin/${path.join('/')}`
  const init: RequestInit = {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.adminToken}`,
    },
  }
  if (request.method === 'POST') {
    init.body = await request.text()
  }

  try {
    const res = await fetch(url, init)
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Network error' },
      { status: 502 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await params).path)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, (await params).path)
}
