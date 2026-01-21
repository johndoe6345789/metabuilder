/**
 * OpenAPI Specification Endpoint
 *
 * Serves the raw OpenAPI 3.0 specification for MetaBuilder API
 * Used by Swagger UI and other API documentation tools
 */

import { readFileSync } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

/**
 * GET /api/docs/openapi - Raw OpenAPI specification
 *
 * Returns the OpenAPI 3.0 specification in JSON format
 */
export async function GET() {
  try {
    // Read the OpenAPI specification from the docs folder
    const specPath = path.join(
      process.cwd(),
      'frontends/nextjs/src/app/api/docs/openapi.json'
    )
    const specContent = readFileSync(specPath, 'utf-8')
    const spec = JSON.parse(specContent)

    return NextResponse.json(spec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*', // Allow CORS for documentation tools
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to load OpenAPI specification:', errorMessage)

    return NextResponse.json(
      {
        error: 'Failed to load API specification',
        message: errorMessage,
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
