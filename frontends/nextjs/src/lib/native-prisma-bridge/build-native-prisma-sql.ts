import { Prisma } from '@prisma/client'
import { splitSqlTemplate } from './split-sql-template'
import { toTemplateStrings } from './to-template-strings'

export function buildNativePrismaSql(sql: string, params: unknown[]): Prisma.Sql {
  const { strings, values } = splitSqlTemplate(sql, params)
  return Prisma.sql(toTemplateStrings(strings), ...values)
}
