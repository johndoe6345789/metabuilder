#!/usr/bin/env node
/**
 * CLI tool for package schema management
 * 
 * Commands:
 *   validate <package>  - Validate package schema and queue changes
 *   list                - List pending migrations
 *   approve <id>        - Approve a migration
 *   reject <id>         - Reject a migration
 *   generate            - Generate Prisma fragment for approved migrations
 *   status              - Show overall migration status
 *   prefix <pkg> <entity> - Show prefixed entity name
 */

import * as path from 'path'
import * as fs from 'fs'
import {
  loadSchemaRegistry,
  saveSchemaRegistry,
  validateAndQueueSchema,
  getPendingMigrations,
  approveMigration,
  rejectMigration,
  generatePrismaFragment,
  needsContainerRestart,
  loadPackageSchema,
  computeSchemaChecksum,
  entityToPrisma,
  getPrefixedEntityName,
  packageToPascalCase,
  extractPackageFromPrefix,
  extractEntityFromPrefix,
  type SchemaRegistry,
} from './schema-registry'

const REGISTRY_PATH = path.join(__dirname, '../../prisma/schema-registry.json')
const PACKAGES_PATH = path.join(__dirname, '../../packages')
const PRISMA_GENERATED_PATH = path.join(__dirname, '../../prisma/generated-from-packages.prisma')

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
}

const printUsage = (): void => {
  console.log(`
${colors.cyan}Package Schema Manager${colors.reset}

Usage: npx ts-node tools/codegen/schema-cli.ts <command> [args]

Commands:
  ${colors.green}scan${colors.reset}              Scan all packages for schema changes
  ${colors.green}validate${colors.reset} <pkg>   Validate specific package schema
  ${colors.green}list${colors.reset}              List pending migrations
  ${colors.green}approve${colors.reset} <id>     Approve a migration (or 'all')
  ${colors.green}reject${colors.reset} <id>      Reject a migration
  ${colors.green}generate${colors.reset}          Generate Prisma fragment
  ${colors.green}preview${colors.reset} <pkg>    Preview Prisma output for package
  ${colors.green}prefix${colors.reset} <pkg> [entity]  Show prefixed entity name
  ${colors.green}status${colors.reset}            Show migration status

Examples:
  npx ts-node tools/codegen/schema-cli.ts scan
  npx ts-node tools/codegen/schema-cli.ts approve all
  npx ts-node tools/codegen/schema-cli.ts preview audit_log
  npx ts-node tools/codegen/schema-cli.ts prefix forum_forge Post
`)
}

const cmdScan = (registry: SchemaRegistry): void => {
  log.info('Scanning packages for schema definitions...')
  
  const packages = fs.readdirSync(PACKAGES_PATH)
    .filter(p => fs.statSync(path.join(PACKAGES_PATH, p)).isDirectory())
  
  let totalQueued = 0
  let totalErrors = 0
  
  for (const pkg of packages) {
    const pkgPath = path.join(PACKAGES_PATH, pkg)
    const schemaPath = path.join(pkgPath, 'seed', 'schema', 'entities.yaml')
    
    if (!fs.existsSync(schemaPath)) {
      continue
    }
    
    const result = validateAndQueueSchema(pkg, pkgPath, registry)
    
    if (!result.valid) {
      log.error(`${pkg}: ${result.errors.length} error(s)`)
      result.errors.forEach(e => console.log(`  ${colors.dim}${e}${colors.reset}`))
      totalErrors += result.errors.length
    } else if (result.queued.length > 0) {
      log.warn(`${pkg}: ${result.queued.length} migration(s) queued`)
      result.queued.forEach(q => 
        console.log(`  ${colors.dim}${q.action} ${q.entityName}${colors.reset}`)
      )
      totalQueued += result.queued.length
    } else {
      log.success(`${pkg}: up to date`)
    }
  }
  
  console.log('')
  if (totalErrors > 0) {
    log.error(`${totalErrors} total error(s) - fix conflicts before proceeding`)
  } else if (totalQueued > 0) {
    log.warn(`${totalQueued} migration(s) pending admin approval`)
    log.info('Run: npx ts-node tools/codegen/schema-cli.ts list')
  } else {
    log.success('All packages up to date')
  }
  
  saveSchemaRegistry(REGISTRY_PATH, registry)
}

const cmdList = (registry: SchemaRegistry): void => {
  const pending = getPendingMigrations(registry)
  
  if (pending.length === 0) {
    log.success('No pending migrations')
    return
  }
  
  console.log(`\n${colors.cyan}Pending Migrations (${pending.length})${colors.reset}\n`)
  
  for (const m of pending) {
    console.log(`${colors.yellow}ID:${colors.reset} ${m.id.slice(0, 8)}`)
    console.log(`${colors.dim}Package:${colors.reset} ${m.packageId}`)
    console.log(`${colors.dim}Action:${colors.reset} ${m.action} ${m.entityName}`)
    console.log(`${colors.dim}Created:${colors.reset} ${new Date(m.createdAt).toLocaleString()}`)
    console.log(`${colors.dim}Checksum:${colors.reset} ${m.currentChecksum || '(new)'} → ${m.newChecksum}`)
    console.log(`${colors.dim}Prisma Preview:${colors.reset}`)
    console.log(m.prismaPreview.split('\n').map(l => `  ${l}`).join('\n'))
    console.log('')
  }
  
  log.info('To approve: npx ts-node tools/codegen/schema-cli.ts approve <id>')
  log.info('To approve all: npx ts-node tools/codegen/schema-cli.ts approve all')
}

const cmdApprove = (registry: SchemaRegistry, idOrAll: string): void => {
  const adminId = process.env.USER || 'cli-admin'
  
  if (idOrAll === 'all') {
    const pending = getPendingMigrations(registry)
    if (pending.length === 0) {
      log.info('No pending migrations to approve')
      return
    }
    
    for (const m of pending) {
      approveMigration(registry, m.id, adminId)
      log.success(`Approved: ${m.entityName} (${m.packageId})`)
    }
    
    saveSchemaRegistry(REGISTRY_PATH, registry)
    log.info(`${pending.length} migration(s) approved`)
    log.warn('Container restart required to apply migrations')
    log.info('Run: npx ts-node tools/codegen/schema-cli.ts generate')
  } else {
    const migration = registry.migrationQueue.find(m => m.id.startsWith(idOrAll))
    if (!migration) {
      log.error(`Migration not found: ${idOrAll}`)
      return
    }
    
    if (approveMigration(registry, migration.id, adminId)) {
      saveSchemaRegistry(REGISTRY_PATH, registry)
      log.success(`Approved: ${migration.entityName} (${migration.packageId})`)
      log.warn('Container restart required to apply migrations')
    } else {
      log.error('Failed to approve migration')
    }
  }
}

const cmdReject = (registry: SchemaRegistry, id: string): void => {
  const adminId = process.env.USER || 'cli-admin'
  const migration = registry.migrationQueue.find(m => m.id.startsWith(id))
  
  if (!migration) {
    log.error(`Migration not found: ${id}`)
    return
  }
  
  if (rejectMigration(registry, migration.id, adminId)) {
    saveSchemaRegistry(REGISTRY_PATH, registry)
    log.success(`Rejected: ${migration.entityName}`)
  } else {
    log.error('Failed to reject migration')
  }
}

const cmdGenerate = (registry: SchemaRegistry): void => {
  const fragment = generatePrismaFragment(registry)
  
  if (!fragment) {
    log.info('No approved migrations to generate')
    return
  }
  
  fs.writeFileSync(PRISMA_GENERATED_PATH, fragment)
  log.success(`Generated: ${PRISMA_GENERATED_PATH}`)
  log.info('Add to prisma/schema.prisma or use Prisma imports')
  log.warn('Run: npx prisma migrate dev --name package-schemas')
}

const cmdPreview = (packageId: string): void => {
  const pkgPath = path.join(PACKAGES_PATH, packageId)
  
  if (!fs.existsSync(pkgPath)) {
    log.error(`Package not found: ${packageId}`)
    return
  }
  
  const schema = loadPackageSchema(pkgPath)
  if (!schema) {
    log.info(`No schema defined for ${packageId}`)
    return
  }
  
  console.log(`\n${colors.cyan}Prisma Preview for ${packageId}${colors.reset}\n`)
  
  for (const entity of schema.entities) {
    const checksum = computeSchemaChecksum(entity)
    console.log(`${colors.dim}// Entity: ${entity.name} (checksum: ${checksum})${colors.reset}`)
    console.log(entityToPrisma(entity))
    console.log('')
  }
}

const cmdStatus = (registry: SchemaRegistry): void => {
  const pending = registry.migrationQueue.filter(m => m.status === 'pending').length
  const approved = registry.migrationQueue.filter(m => m.status === 'approved').length
  const applied = registry.migrationQueue.filter(m => m.status === 'applied').length
  const rejected = registry.migrationQueue.filter(m => m.status === 'rejected').length
  
  console.log(`\n${colors.cyan}Schema Migration Status${colors.reset}\n`)
  console.log(`Registered entities: ${Object.keys(registry.entities).length}`)
  console.log(`Pending approval:    ${pending}`)
  console.log(`Approved (waiting):  ${approved}`)
  console.log(`Applied:             ${applied}`)
  console.log(`Rejected:            ${rejected}`)
  console.log('')
  
  if (needsContainerRestart(registry)) {
    log.warn('Container restart required - approved migrations waiting')
  } else if (pending > 0) {
    log.info('Migrations pending admin review')
  } else {
    log.success('All schemas up to date')
  }
}

const cmdPrefix = (packageId: string, entityName?: string): void => {
  console.log(`\n${colors.cyan}Entity Prefix Info${colors.reset}\n`)
  console.log(`Package:      ${packageId}`)
  console.log(`Pascal Case:  ${packageToPascalCase(packageId)}`)
  console.log(`Prefix:       Pkg_${packageToPascalCase(packageId)}_`)
  
  if (entityName) {
    const prefixed = getPrefixedEntityName(packageId, entityName)
    console.log(`\n${colors.green}Entity:${colors.reset}       ${entityName}`)
    console.log(`${colors.green}Prefixed:${colors.reset}     ${prefixed}`)
    console.log(`${colors.green}Table:${colors.reset}        ${packageId}_${entityName.toLowerCase()}`)
  } else {
    // Show all entities from package schema
    const pkgPath = path.join(PACKAGES_PATH, packageId)
    const schema = loadPackageSchema(pkgPath)
    if (schema && schema.entities) {
      console.log(`\n${colors.yellow}Entities in package:${colors.reset}`)
      for (const entity of schema.entities) {
        const prefixed = getPrefixedEntityName(packageId, entity.name)
        console.log(`  ${entity.name} → ${prefixed}`)
        console.log(`    ${colors.dim}Table: ${packageId}_${entity.name.toLowerCase()}${colors.reset}`)
      }
    }
  }
  console.log('')
}

// Main
const main = (): void => {
  const args = process.argv.slice(2)
  const command = args[0]
  
  if (!command || command === 'help' || command === '--help') {
    printUsage()
    return
  }
  
  const registry = loadSchemaRegistry(REGISTRY_PATH)
  
  switch (command) {
    case 'scan':
      cmdScan(registry)
      break
    case 'validate':
      if (!args[1]) {
        log.error('Package name required')
        break
      }
      const pkgPath = path.join(PACKAGES_PATH, args[1])
      const result = validateAndQueueSchema(args[1], pkgPath, registry)
      if (result.valid) {
        log.success(`Valid: ${args[1]}`)
        if (result.queued.length > 0) {
          log.warn(`${result.queued.length} migration(s) queued`)
        }
      } else {
        result.errors.forEach(e => log.error(e))
      }
      saveSchemaRegistry(REGISTRY_PATH, registry)
      break
    case 'list':
      cmdList(registry)
      break
    case 'approve':
      if (!args[1]) {
        log.error('Migration ID or "all" required')
        break
      }
      cmdApprove(registry, args[1])
      break
    case 'reject':
      if (!args[1]) {
        log.error('Migration ID required')
        break
      }
      cmdReject(registry, args[1])
      break
    case 'generate':
      cmdGenerate(registry)
      break
    case 'preview':
      if (!args[1]) {
        log.error('Package name required')
        break
      }
      cmdPreview(args[1])
      break
    case 'status':
      cmdStatus(registry)
      break
    case 'prefix':
      if (!args[1]) {
        log.error('Package name required')
        log.info('Usage: prefix <package> [entity]')
        break
      }
      cmdPrefix(args[1], args[2])
      break
    default:
      log.error(`Unknown command: ${command}`)
      printUsage()
  }
}

main()
