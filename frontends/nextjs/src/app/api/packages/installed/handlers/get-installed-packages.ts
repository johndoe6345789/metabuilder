import { NextResponse } from 'next/server'
import { getInstalledPackages } from '@/lib/db/packages/get-installed-packages'

export async function GET() {
  try {
    const installed = await getInstalledPackages()
    return NextResponse.json({ installed })
  } catch (error) {
    console.error('Error fetching installed packages:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch installed packages',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
