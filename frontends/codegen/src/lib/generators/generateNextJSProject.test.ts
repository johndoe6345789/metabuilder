import { describe, expect, it } from 'vitest'
import { generateNextJSProject } from './generateNextJSProject'
import type { DbModel, ComponentNode, ThemeConfig } from '@/types/project'

const emptyTheme: ThemeConfig = {
  variants: [],
  activeVariantId: 'light',
  fontFamily: 'Roboto',
  fontSize: { small: 12, medium: 14, large: 16 },
  spacing: 8,
  borderRadius: 4,
}

function makeModel(id: string, name: string): DbModel {
  return { id, name, fields: [] }
}

function makeNode(id: string, type: string): ComponentNode {
  return { id, type, props: {}, children: [], name: type }
}

describe('generateNextJSProject', () => {
  it('generates package.json with project name', () => {
    const files = generateNextJSProject('my-app', [], [], emptyTheme)
    expect(files['package.json']).toBeDefined()
    const pkg = JSON.parse(files['package.json'])
    expect(pkg.name).toBe('my-app')
    expect(pkg.scripts.dev).toBe('next dev')
  })

  it('generates prisma/schema.prisma', () => {
    const files = generateNextJSProject('app', [], [], emptyTheme)
    expect(files['prisma/schema.prisma']).toBeDefined()
    expect(files['prisma/schema.prisma']).toContain('generator client')
  })

  it('includes models in prisma schema', () => {
    const files = generateNextJSProject('app', [makeModel('m1', 'User')], [], emptyTheme)
    expect(files['prisma/schema.prisma']).toContain('model User {')
  })

  it('generates src/app/page.tsx', () => {
    const files = generateNextJSProject('app', [], [], emptyTheme)
    expect(files['src/app/page.tsx']).toBeDefined()
    expect(files['src/app/page.tsx']).toContain('app-shell')
  })

  it('generates next.config.js', () => {
    const files = generateNextJSProject('app', [], [], emptyTheme)
    expect(files['next.config.js']).toBeDefined()
    expect(files['next.config.js']).toContain('nextConfig')
  })

  it('generates .env with DATABASE_URL placeholder', () => {
    const files = generateNextJSProject('app', [], [], emptyTheme)
    expect(files['.env']).toContain('DATABASE_URL')
  })

  it('generates README.md', () => {
    const files = generateNextJSProject('my-project', [], [], emptyTheme)
    expect(files['README.md']).toContain('my-project')
    expect(files['README.md']).toContain('npm install')
  })

  it('generates src/theme.ts with design tokens', () => {
    const files = generateNextJSProject('app', [], [], emptyTheme)
    expect(files['src/theme.ts']).toBeDefined()
    expect(files['src/theme.ts']).toContain('m3-scss')
    expect(files['src/theme.ts']).toContain('fontFamily')
  })
})
