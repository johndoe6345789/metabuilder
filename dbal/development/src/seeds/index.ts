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

/**
 * Seed the database using seed data from /dbal/shared/seeds/ folder
 *
 * Loads seed data files and applies them using entity operations.
 * All seeds are idempotent - they check if data exists before creating.
 *
 * @param dbal DBALClient instance for database access
 */
export async function seedDatabase(dbal: DBALClient): Promise<void> {
  const seedDir = path.resolve(__dirname, '../../shared/seeds/database')
  const packagesDir = path.resolve(__dirname, '../../../packages')

  // 1. Load installed_packages.yaml
  const packagesPath = path.join(seedDir, 'installed_packages.yaml')
  const packagesYaml = fs.readFileSync(packagesPath, 'utf8')
  const packagesData = yaml.parse(packagesYaml)

  // 2. Insert packages (skip if already exists - idempotent)
  for (const pkg of packagesData.records) {
    try {
      await dbal.installedPackages.read(pkg.packageId)
      console.log(`Package ${pkg.packageId} already installed, skipping`)
    } catch (error) {
      // Package doesn't exist, create it
      // Parse config from YAML string to JSON object
      const config = typeof pkg.config === 'string'
        ? JSON.parse(pkg.config.trim())
        : pkg.config || {}

      await dbal.installedPackages.create({
        packageId: pkg.packageId,
        tenantId: pkg.tenantId || null,
        installedAt: BigInt(Date.now()),
        version: pkg.version,
        enabled: pkg.enabled,
        config: JSON.stringify(config)
      })
      console.log(`Installed package: ${pkg.packageId}`)
    }
  }

  // 3. Load PageConfig entries from package seed/metadata.json files
  for (const pkg of packagesData.records) {
    const metadataPath = path.join(packagesDir, pkg.packageId, 'seed', 'metadata.json')

    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))

      if (metadata.exports?.pages) {
        for (const page of metadata.exports.pages) {
          // Check if page already exists
          const existing = await dbal.pageConfigs.list({
            filter: { path: page.path }
          })

          if (existing.data.length === 0) {
            await dbal.pageConfigs.create({
              id: `page_${pkg.packageId}_${page.path.replace(/\//g, '_')}`,
              tenantId: null,
              packageId: pkg.packageId,
              path: page.path,
              title: page.title,
              description: page.description || null,
              icon: null,
              component: page.component,
              componentTree: '{}', // Empty for now - will be populated later
              level: page.level,
              requiresAuth: page.requiresAuth,
              requiredRole: null,
              parentPath: null,
              sortOrder: 0,
              isPublished: page.isPublished,
              params: null,
              meta: null,
              createdAt: BigInt(Date.now()),
              updatedAt: BigInt(Date.now())
            })
            console.log(`Created PageConfig for: ${page.path}`)
          }
        }
      }
    }
  }

  console.log('Database seeded successfully')
}
