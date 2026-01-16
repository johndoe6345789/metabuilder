import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: '../shared/prisma/schema.prisma',
  migrations: {
    path: '../shared/prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
