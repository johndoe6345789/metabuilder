import { getStatusResponse } from '@dbal-ui/status'
import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json(getStatusResponse())
}
