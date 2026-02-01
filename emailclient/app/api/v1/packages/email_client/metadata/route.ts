/**
 * GET /api/v1/packages/email_client/metadata
 * Returns email_client package metadata
 */

import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Return email_client package metadata
    const metadata = {
      id: 'email_client',
      name: 'Email Client',
      description: 'Full-featured email client with IMAP/SMTP support',
      version: '1.0.0',
      package: 'email_client'
    }

    return NextResponse.json(metadata)
  } catch (error) {
    console.error('[email-client-api] Error loading metadata:', error)
    return NextResponse.json(
      { error: 'Failed to load email client metadata' },
      { status: 500 }
    )
  }
}
