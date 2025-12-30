import type { PrismaContext } from '../types'
import { DBALError } from '../../core/foundation/errors'

type PrismaModelDelegate = {
  findMany: (...args: unknown[]) => Promise<unknown[]>
  findUnique: (...args: unknown[]) => Promise<unknown | null>
  findFirst: (...args: unknown[]) => Promise<unknown | null>
  create: (...args: unknown[]) => Promise<unknown>
  createMany: (...args: unknown[]) => Promise<{ count: number }>
  update: (...args: unknown[]) => Promise<unknown>
  updateMany: (...args: unknown[]) => Promise<{ count: number }>
  delete: (...args: unknown[]) => Promise<unknown>
  deleteMany: (...args: unknown[]) => Promise<{ count: number }>
  upsert: (...args: unknown[]) => Promise<unknown>
}

export function getModel(context: PrismaContext, entity: string): PrismaModelDelegate {
  const modelName = entity.charAt(0).toLowerCase() + entity.slice(1)
  const model = (context.prisma as Record<string, PrismaModelDelegate>)[modelName]

  if (!model) {
    throw DBALError.notFound(`Entity ${entity} not found`)
  }

  return model
}

export function buildWhereClause(filter: Record<string, unknown>): Record<string, unknown> {
  const where: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(filter)) {
    if (value === null || value === undefined) {
      where[key] = null
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      where[key] = value
    } else {
      where[key] = value
    }
  }

  return where
}

export function buildOrderBy(sort: Record<string, 'asc' | 'desc'>): Record<string, string> {
  return sort
}

export async function withTimeout<T>(context: PrismaContext, promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(DBALError.timeout()), context.queryTimeout)
    )
  ])
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('not found')
}

export function handlePrismaError(
  error: unknown,
  operation: string,
  entity: string
): DBALError {
  if (error instanceof DBALError) {
    return error
  }

  if (error instanceof Error) {
    if (error.message.includes('Unique constraint')) {
      return DBALError.conflict(`${entity} already exists`)
    }
    if (error.message.includes('Foreign key constraint')) {
      return DBALError.validationError('Related resource not found')
    }
    if (error.message.includes('not found')) {
      return DBALError.notFound(`${entity} not found`)
    }
    return DBALError.internal(`Database error during ${operation}: ${error.message}`)
  }

  return DBALError.internal(`Unknown error during ${operation}`)
}
