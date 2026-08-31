import { NextResponse } from 'next/server'
import { STATUS } from './status'

export function successResponse(data: unknown, status = STATUS.OK) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = STATUS.ERROR) {
  return NextResponse.json({ error: message }, { status })
}
