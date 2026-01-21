import { PrismaModel } from '@/types/project'

export function generatePrismaSchema(models: PrismaModel[]): string {
  let schema = `generator client {\n  provider = "prisma-client-js"\n}\n\n`
  schema += `datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n`

  models.forEach((model) => {
    schema += `model ${model.name} {\n`
    model.fields.forEach((field) => {
      let fieldLine = `  ${field.name} ${field.type}`
      if (field.isArray) fieldLine += '[]'
      if (field.isRequired && !field.defaultValue) fieldLine += ''
      else if (!field.isRequired) fieldLine += '?'
      if (field.isUnique) fieldLine += ' @unique'
      if (field.defaultValue) fieldLine += ` @default(${field.defaultValue})`
      schema += fieldLine + '\n'
    })
    schema += `}\n\n`
  })

  return schema
}
