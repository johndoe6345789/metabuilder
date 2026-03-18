import { NextRequest, NextResponse } from 'next/server'

const DBAL_DAEMON_URL = process.env.DBAL_DAEMON_URL ?? 'http://localhost:8080'

export async function POST(request: NextRequest) {
  const { method, path, body } = await request.json()

  const url = `${DBAL_DAEMON_URL}${path}`

  try {
    const fetchOptions: RequestInit = {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    }

    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body)
    }

    const response = await fetch(url, fetchOptions)
    const text = await response.text()
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      data,
      url,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({
      status: 0,
      statusText: 'Network Error',
      data: { error: err instanceof Error ? err.message : 'Unknown error' },
      url,
      timestamp: new Date().toISOString(),
    }, { status: 502 })
  }
}
