import { NextResponse } from 'next/server'
import { getStatusResponse } from '@dbal-ui/status'

export function GET() {
  return NextResponse.json(getStatusResponse())
}
