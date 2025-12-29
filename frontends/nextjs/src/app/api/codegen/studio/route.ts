import { NextResponse } from 'next/server'

import type { CodegenSpec } from '@/lib/codegen/codegen-types'
import { generateCodegenZip } from '@/lib/codegen/generate-codegen-zip'

const normalizeRuntime = (value: string | undefined): CodegenSpec['runtime'] => {
  const runtime = (value ?? 'web').toLowerCase()
  if (['cli', 'desktop', 'hybrid', 'server'].includes(runtime))
    return runtime as CodegenSpec['runtime']
  return 'web'
}

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as Partial<CodegenSpec>
    const spec: CodegenSpec = {
      projectName: body.projectName?.trim() || 'meta-starter',
      packageId: body.packageId?.trim() || 'codegen_studio',
      runtime: normalizeRuntime(body.runtime),
      tone: body.tone,
      brief: body.brief,
    }
    const { zipBuffer, fileName, manifest } = await generateCodegenZip(spec)
    const headers = new Headers({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'X-Codegen-Manifest': encodeURIComponent(JSON.stringify(manifest)),
    })
    return new NextResponse(zipBuffer, { status: 200, headers })
  } catch (error) {
    console.error('Codegen export failed:', error)
    return NextResponse.json(
      {
        error: 'Unable to generate code bundle',
        details: error instanceof Error ? error.message : 'unknown error',
      },
      { status: 500 }
    )
  }
}
