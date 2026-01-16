/**
 * @file seeds/index.ts
 * @description Database Seed Orchestration
 *
 * Orchestrates loading and applying seed data from /dbal/shared/seeds/ folder.
 * DBAL does NOT define what to seed - that lives in /dbal/shared/seeds/ as data files.
 * DBAL only manages the loading and application of that seed data.
 *
 * Seed data hierarchy:
 * 1. /dbal/shared/seeds/database - Base system bootstrap data (YAML format)
 * 2. /dbal/shared/seeds/config - Bootstrap configuration (YAML format)
 * 3. /dbal/shared/seeds/packages - Package installation order (YAML format)
 * 4. packages/[packageId]/seed/metadata.json - Package-specific seed data
 */

import fs from 'fs'
import path from 'path'
import yaml from 'yaml'
import type { DBALClient } from '../core/client'
import { getPrismaClient } from '../runtime/prisma-client'

/**
 * Seed the database using seed data from /dbal/shared/seeds/ folder
 *
 * Loads seed data files and applies them using entity operations.
 * All seeds are idempotent - they check if data exists before creating.
 *
 * @param dbal DBALClient instance for database access
 */
export async function seedDatabase(dbal: DBALClient): Promise<void> {
  // __dirname resolves to dist directory, so we need to go up 3 levels
  // dist -> src -> development -> . -> dbal -> shared/seeds/database
  const seedDir = path.resolve(__dirname, '../../../shared/seeds/database')
  const packagesDir = path.resolve(__dirname, '../../../../packages')

  // 1. Load installed_packages.yaml
  const packagesPath = path.join(seedDir, 'installed_packages.yaml')
  const packagesYaml = fs.readFileSync(packagesPath, 'utf8')
  const packagesData = yaml.parse(packagesYaml)

  // 2. Insert packages (skip if already exists - idempotent)
  // Note: Using Prisma directly for system packages (tenantId = null) to bypass ACL
  const prisma = getPrismaClient()
  for (const pkg of packagesData.records) {
    try {
      const existing = await prisma.installedPackage.findFirst({
        where: { packageId: pkg.packageId }
      })
      if (existing) {
        console.log(`Package ${pkg.packageId} already installed, skipping`)
        continue
      }
    } catch (e) {
      // Not found, proceed with creation
    }

    // Parse config from YAML string to JSON object
    const config = typeof pkg.config === 'string'
      ? JSON.parse(pkg.config.trim())
      : pkg.config || {}

    try {
      await prisma.installedPackage.create({
        data: {
          packageId: pkg.packageId,
          tenantId: pkg.tenantId || null,
          installedAt: BigInt(Date.now()),
          version: pkg.version,
          enabled: pkg.enabled,
          config: JSON.stringify(config)
        }
      })
      console.log(`Installed package: ${pkg.packageId}`)
    } catch (error) {
      if ((error as any).code === 'P2002') {
        console.log(`Package ${pkg.packageId} already exists, skipping`)
      } else {
        throw error
      }
    }
  }

  // 3. Load PageConfig entries from package seed/page-config.json files
  for (const pkg of packagesData.records) {
    const seedMetadataPath = path.join(packagesDir, pkg.packageId, 'seed', 'metadata.json')

    // Check if this package has seed data
    if (fs.existsSync(seedMetadataPath)) {
      const seedMetadata = JSON.parse(fs.readFileSync(seedMetadataPath, 'utf8'))

      // Get the reference to the actual seed data file (e.g., page-config.json)
      const seedFile = seedMetadata.seed?.schema
      if (seedFile) {
        const seedDataPath = path.join(packagesDir, pkg.packageId, 'seed', seedFile)

        if (fs.existsSync(seedDataPath)) {
          const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'))

          // seedData should be an array of PageConfig entries
          const pages = Array.isArray(seedData) ? seedData : []

          for (const page of pages) {
            // Check if page already exists
            const existing = await prisma.pageConfig.findFirst({
              where: { path: page.path }
            })

            if (!existing) {
              try {
                await prisma.pageConfig.create({
                  data: {
                    id: page.id || `page_${pkg.packageId}_${page.path.replace(/\//g, '_')}`,
                    tenantId: page.tenantId || null,
                    packageId: pkg.packageId,
                    path: page.path,
                    title: page.title,
                    description: page.description || null,
                    icon: page.icon || null,
                    component: page.component,
                    componentTree: page.componentTree || '{}',
                    level: page.level || 0,
                    requiresAuth: page.requiresAuth === true,
                    requiredRole: page.requiredRole || null,
                    parentPath: page.parentPath || null,
                    sortOrder: page.sortOrder || 0,
                    isPublished: page.isPublished === true,
                    params: page.params || null,
                    meta: page.meta || null,
                    createdAt: BigInt(Date.now()),
                    updatedAt: BigInt(Date.now())
                  }
                })
                console.log(`Created PageConfig for: ${page.path}`)
              } catch (error) {
                if ((error as any).code === 'P2002') {
                  console.log(`PageConfig ${page.path} already exists, skipping`)
                } else {
                  throw error
                }
              }
            }
          }
        }
      }
    }
  }

  console.log('Database seeded successfully')
}
