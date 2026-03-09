/**
 * Workflow Execution Endpoint
 * PHASE 5: Full workflow integration
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ tenant: string; workflowId: string }> },
) {
  try {
    const { tenant: _tenant, workflowId: _workflowId } = await params

    return NextResponse.json(
      {
        error: 'Workflow execution not yet implemented',
        message: 'Phase 5: Workflow execution requires @metabuilder/workflow integration',
        hint: 'This endpoint will be available in Phase 5',
      },
      { status: 501 },
    )
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function GET(
  _req: NextRequest,
  { params: _params }: { params: Promise<{ tenant: string; workflowId: string }> },
) {
  return NextResponse.json(
    {
      error: 'Workflow execution not yet implemented',
      message: 'Phase 5: Workflow execution requires @metabuilder/workflow integration',
    },
    { status: 501 },
  )
}
