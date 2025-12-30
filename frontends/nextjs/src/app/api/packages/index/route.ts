import { readFile } from 'fs/promises'
import { NextResponse } from 'next/server'
import { join } from 'path'

/**
 * GET /api/packages/index
 * Returns the package index from packages/index.json
 */
export async function GET() {
  try {
    // Determine the path to packages/index.json
    // In development, this is relative to the project root
    // In production, it should be bundled or served from a known location
    const indexPath = join(process.cwd(), '..', '..', '..', 'packages', 'index.json')
    
    const indexContent = await readFile(indexPath, 'utf-8')
    const indexData = JSON.parse(indexContent)

    return NextResponse.json(indexData, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Failed to load package index:', error)
    
    // Return empty index on error
    return NextResponse.json(
      { packages: [], error: 'Failed to load package index' },
      { status: 500 }
    )
  }
}
