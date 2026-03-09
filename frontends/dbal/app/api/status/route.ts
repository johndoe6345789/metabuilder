import { NextResponse } from 'next/server'
import { getStatusResponse } from '@/status'

export async function GET() {
  const status = await getStatusResponse()
  return NextResponse.json(status)
}
