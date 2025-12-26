#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const prisma = new PrismaClient()

const __dirname = dirname(fileURLToPath(import.meta.url))

const readStdin = async () => {
  const chunks = []
  for await (const chunk of process.stdin) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString('utf-8')
}

const main = async () => {
  try {
    await prisma.$connect()

    const input = await readStdin()
    let payload = {}
    try {
      payload = input ? JSON.parse(input) : {}
    } catch {
      // ignore parse errors
    }

    if (payload?.action === 'status') {
      console.log(JSON.stringify({ status: 'ok', version: 'native-prisma-bridge' }))
      return
    }

    console.log(JSON.stringify({ status: 'ok', message: 'Native Prisma bridge ready', payload }))
  } catch (error) {
    console.error(JSON.stringify({ status: 'error', error: error instanceof Error ? error.message : 'unknown' }))
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

void main()
