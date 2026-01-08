import { NextResponse } from 'next/server'
import { getStatusResponse } from '@/status'

export function GET() {
  return NextResponse.json(getStatusResponse())
}
