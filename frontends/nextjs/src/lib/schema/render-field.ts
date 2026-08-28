/**
 * One schema field rendered as a line of Prisma model source.
 *
 * Split out of schema-registry.ts, where it was 150 lines of the 577 and the
 * part with the most branches: list vs scalar, optional vs required, id
 * detection across four spellings, and default values that may be literals or
 * function calls.
 */

export type FieldSpec = {
  name: string
  type?: string
  required?: boolean
  nullable?: boolean
  optional?: boolean
  unique?: boolean
  default?: unknown
  id?: boolean
  primary?: boolean
  isId?: boolean
  list?: boolean
  array?: boolean
  generated?: boolean
}

export function renderSchemaField(field: FieldSpec): string | null {
  if (!isValidIdentifier(field.name)) return null

  // A field can say it is a list either in its type ("String[]") or with a
  // flag. Both spellings are in the FieldSpec and only the first was read,
  // so `{ type: 'string', list: true }` silently rendered as a scalar.
  const parsed = normalizeFieldType(field.type)
  const isList = parsed.isList || field.list === true || field.array === true
  const { baseType } = parsed
  const isOptional =
    field.nullable === true ||
    field.required === false ||
    field.optional === true
  const isId =
    field.id === true ||
    field.primary === true ||
    field.isId === true ||
    field.name === 'id'

  const attributes: string[] = []
  if (isId) attributes.push('@id')

  const defaultAttr = resolveDefaultAttribute(field.default)
  if (!isList && defaultAttr !== null) attributes.push(defaultAttr)

  if (
    field.generated === true &&
    !attributes.some(attr => attr.startsWith('@default('))
  ) {
    if (baseType === 'String') attributes.push('@default(cuid())')
    if (baseType === 'Int' || baseType === 'BigInt')
      attributes.push('@default(autoincrement())')
  }

  if (isId && !attributes.some(attr => attr.startsWith('@default('))) {
    if (baseType === 'String') attributes.push('@default(cuid())')
    if (baseType === 'Int' || baseType === 'BigInt')
      attributes.push('@default(autoincrement())')
  }

  if (
    field.name === 'createdAt' &&
    baseType === 'DateTime' &&
    !attributes.some(attr => attr.startsWith('@default('))
  ) {
    attributes.push('@default(now())')
  }

  if (
    field.name === 'updatedAt' &&
    baseType === 'DateTime' &&
    !attributes.includes('@updatedAt')
  ) {
    attributes.push('@updatedAt')
  }

  if (field.unique === true && !isId) attributes.push('@unique')

  const typeSuffix = isList ? '[]' : isOptional ? '?' : ''
  const attrSuffix = attributes.length > 0 ? ` ${attributes.join(' ')}` : ''

  return `${field.name} ${baseType}${typeSuffix}${attrSuffix}`
}

function normalizeFieldType(rawType: string | undefined): {
  baseType: string
  isList: boolean
} {
  const trimmed = typeof rawType === 'string' ? rawType.trim() : ''
  const listDetected = trimmed.endsWith('[]')
  const base = listDetected ? trimmed.slice(0, -2) : trimmed
  const normalized = base.toLowerCase()

  switch (normalized) {
    case 'string':
    case 'text':
    case 'uuid':
    case 'cuid':
    case 'email':
    case 'url':
    case 'slug':
      return { baseType: 'String', isList: listDetected }
    case 'int':
    case 'integer':
      return { baseType: 'Int', isList: listDetected }
    case 'bigint':
      return { baseType: 'BigInt', isList: listDetected }
    case 'float':
    case 'double':
    case 'number':
      return { baseType: 'Float', isList: listDetected }
    case 'decimal':
      return { baseType: 'Decimal', isList: listDetected }
    case 'boolean':
    case 'bool':
      return { baseType: 'Boolean', isList: listDetected }
    case 'date':
    case 'datetime':
    case 'timestamp':
      return { baseType: 'DateTime', isList: listDetected }
    case 'json':
    case 'object':
    case 'map':
      return { baseType: 'Json', isList: listDetected }
    case 'bytes':
    case 'blob':
    case 'binary':
      return { baseType: 'Bytes', isList: listDetected }
    case 'string[]':
      return { baseType: 'String', isList: true }
    case 'int[]':
      return { baseType: 'Int', isList: true }
    default:
      return {
        baseType: base.length > 0 ? base : 'String',
        isList: listDetected,
      }
  }
}

function resolveDefaultAttribute(value: unknown): string | null {
  if (value === null || value === undefined) return null

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (isFunctionDefault(trimmed)) {
      return `@default(${trimmed})`
    }
    return `@default("${escapeString(trimmed)}")`
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return `@default(${value})`
  }

  return null
}

function isFunctionDefault(value: string): boolean {
  const lower = value.toLowerCase()
  return (
    lower === 'now()' ||
    lower === 'cuid()' ||
    lower === 'uuid()' ||
    lower === 'autoincrement()' ||
    lower.startsWith('dbgenerated(')
  )
}

function escapeString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function isValidIdentifier(value: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value)
}
