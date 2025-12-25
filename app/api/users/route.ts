/**
 * Users API Route - Demonstrates DBAL integration
 * 
 * This API route uses DBAL for all database operations, showcasing
 * the proper server-side integration of the DBAL layer.
 */

import { NextResponse } from 'next/server'
import { dbalGetUsers, initializeDBAL } from '@/lib/database-dbal.server'

export async function GET() {
  try {
    // Initialize DBAL on first use
    await initializeDBAL()
    
    // Use DBAL to fetch users
    const users = await dbalGetUsers()
    
    return NextResponse.json({ 
      users,
      source: 'DBAL' 
    })
  } catch (error) {
    console.error('Error fetching users via DBAL:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
