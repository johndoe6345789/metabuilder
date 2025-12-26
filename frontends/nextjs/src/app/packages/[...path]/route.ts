import { NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { getPackageContentType } from '@/lib/packages/server/get-package-content-type'
import { resolvePackageFilePath } from '@/lib/packages/server/resolve-package-file-path'

interface PackageParams {
  path?: string[]
}

export async function GET(request: Request, { params }: { params: PackageParams }) {
  const segments = params.path ?? []
  const filePath = resolvePackageFilePath(segments)

  if (!filePath) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    const contentType = getPackageContentType(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
