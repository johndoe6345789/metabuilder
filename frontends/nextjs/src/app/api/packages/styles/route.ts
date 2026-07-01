import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

type ScalarValue = string | number

interface TokensJson {
  cssVars?: Record<string, string>
  cssVarsDark?: Record<string, string>
  colors?: Record<string, ScalarValue>
  spacing?: Record<string, ScalarValue>
  typography?: Record<string, ScalarValue | Record<string, ScalarValue>>
}

function cssVarsBlock(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')
}

function tokensToCSS(id: string, tokens: TokensJson): string {
  const parts: string[] = [`/* Package: ${id} */`]

  if (tokens.cssVars && Object.keys(tokens.cssVars).length > 0) {
    parts.push(`:root {\n${cssVarsBlock(tokens.cssVars)}\n}`)
  }

  if (tokens.cssVarsDark && Object.keys(tokens.cssVarsDark).length > 0) {
    parts.push(
      `[data-theme="dark"] {\n${cssVarsBlock(tokens.cssVarsDark)}\n}`
    )
  }

  if (tokens.colors && Object.keys(tokens.colors).length > 0) {
    const lines = Object.entries(tokens.colors)
      .map(([k, v]) => `  --pkg-${id}-${k}: ${v};`)
      .join('\n')
    parts.push(`:root {\n${lines}\n}`)
  }

  return parts.join('\n\n')
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.searchParams.get('id')
  if (!id || !/^[a-z0-9_]+$/.test(id)) {
    return new NextResponse('Bad Request', { status: 400 })
  }
  try {
    const p = path.join(
      process.cwd(), '..', '..', 'packages', id, 'styles', 'tokens.json'
    )
    const tokens = JSON.parse(await fs.readFile(p, 'utf-8')) as TokensJson
    return new NextResponse(tokensToCSS(id, tokens), {
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new NextResponse('/* not found */', {
      headers: { 'Content-Type': 'text/css' },
    })
  }
}
