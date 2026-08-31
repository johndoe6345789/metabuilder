import { renderSchemaField } from '../render-field'
import type { ModelSchema } from '../../types/schema-types'
import type { SchemaRegistry } from './registry-class'
import { safeParseJson } from './safe-parse-json'
import { normalizeFields } from './normalize-fields'

const IMPLICIT_FIELDS = [
  ['id', '  id String @id @default(cuid())'],
  ['createdAt', '  createdAt DateTime @default(now())'],
  ['updatedAt', '  updatedAt DateTime @updatedAt'],
] as const

function modelFragment(schema: ModelSchema): string[] {
  const fields = normalizeFields(safeParseJson(schema.fields))
  const fieldNames = new Set(fields.map(field => field.name))

  const lines = [`// Model: ${schema.name}`, `model ${schema.name} {`]

  for (const [name, line] of IMPLICIT_FIELDS) {
    if (!fieldNames.has(name)) lines.push(line)
  }
  for (const field of fields) {
    const line = renderSchemaField(field)
    if (line !== null) lines.push(`  ${line}`)
  }

  lines.push('}', '')
  return lines
}

/** A Prisma-like schema fragment for every registered model, each
 *  gaining the three implicit fields (id/createdAt/updatedAt) it
 *  doesn't already declare for itself. */
export function generateSchemaFragment(registry: SchemaRegistry): string {
  return registry.getAll().flatMap(modelFragment).join('\n')
}
