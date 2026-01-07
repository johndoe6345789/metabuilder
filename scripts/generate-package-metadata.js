#!/usr/bin/env node
/**
 * Generate metadata.json files for all packages
 * This script ensures all packages have proper seed/metadata.json files
 * conforming to the metadata_schema.json in schemas/package-schemas/
 */

const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.join(__dirname, '..', 'packages');
const METADATA_SCHEMA = 'https://metabuilder.dev/schemas/package-metadata.schema.json';

/**
 * Convert package directory name to human-readable name
 * e.g., "ui_auth" -> "UI Auth", "package_manager" -> "Package Manager"
 */
function toHumanReadableName(packageId) {
  return packageId
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Determine package category based on package ID
 */
function determineCategory(packageId) {
  if (packageId.startsWith('ui_')) return 'ui';
  if (packageId.includes('editor')) return 'editor';
  if (packageId.includes('manager')) return 'management';
  if (packageId.includes('database') || packageId.includes('dbal')) return 'database';
  if (packageId.includes('auth') || packageId.includes('login')) return 'auth';
  if (packageId.includes('test')) return 'testing';
  if (packageId.includes('media') || packageId.includes('irc') || packageId.includes('arcade')) return 'media';
  if (packageId.includes('form') || packageId.includes('component')) return 'components';
  return 'utility';
}

/**
 * Generate metadata object for a package
 */
function generateMetadata(packageId) {
  const name = toHumanReadableName(packageId);
  const category = determineCategory(packageId);
  
  return {
    packageId,
    name,
    version: '0.1.0',
    description: `Package ${packageId}`,
    author: 'MetaBuilder Team',
    category,
    exports: {
      components: []
    },
    dependencies: []
  };
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Scanning packages directory...');
  
  // Get all package directories
  const packageDirs = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();
  
  console.log(`📦 Found ${packageDirs.length} packages\n`);
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const packageId of packageDirs) {
    const packagePath = path.join(PACKAGES_DIR, packageId);
    const seedDir = path.join(packagePath, 'seed');
    const metadataPath = path.join(seedDir, 'metadata.json');
    
    // Check if metadata.json already exists
    if (fs.existsSync(metadataPath)) {
      console.log(`⏭️  ${packageId}: metadata.json already exists`);
      skipped++;
      continue;
    }
    
    try {
      // Create seed directory if it doesn't exist
      if (!fs.existsSync(seedDir)) {
        fs.mkdirSync(seedDir, { recursive: true });
        console.log(`📁 ${packageId}: created seed/ directory`);
      }
      
      // Generate metadata
      const metadata = generateMetadata(packageId);
      
      // Write metadata.json
      fs.writeFileSync(
        metadataPath,
        JSON.stringify(metadata, null, 2) + '\n',
        'utf-8'
      );
      
      console.log(`✅ ${packageId}: created metadata.json`);
      created++;
      
    } catch (error) {
      console.error(`❌ ${packageId}: Error - ${error.message}`);
      errors++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📦 Total: ${packageDirs.length}`);
  console.log('='.repeat(60));
  
  if (errors > 0) {
    process.exit(1);
  }
}

// Run the script
main();
