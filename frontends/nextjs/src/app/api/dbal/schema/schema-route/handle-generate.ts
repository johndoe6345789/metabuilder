import { NextResponse } from 'next/server'
import * as fs from 'fs'
import {
  generateSchemaFragment,
  type SchemaRegistry,
} from '@/lib/schema/schema-registry'
import { getSchemaOutputPath } from './paths'

export function handleGenerate(registry: SchemaRegistry) {
  const fragment = generateSchemaFragment(registry)
  const schemaOutputPath = getSchemaOutputPath()

  if (fragment.trim().length === 0) {
    return NextResponse.json({
      status: 'ok',
      action: 'generate',
      message: 'No approved migrations to generate',
      generated: false,
    })
  }

  fs.writeFileSync(schemaOutputPath, fragment)

  return NextResponse.json({
    status: 'ok',
    action: 'generate',
    message: `Generated Prisma fragment at ${schemaOutputPath}`,
    generated: true,
    path: schemaOutputPath,
    nextStep: 'Run: npx prisma migrate dev --name package-schemas',
  })
}
