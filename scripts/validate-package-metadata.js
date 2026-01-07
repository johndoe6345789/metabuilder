#!/usr/bin/env node
/**
 * Validate all package metadata.json files against the schema
 * This performs basic validation without external dependencies
 */

const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.join(__dirname, '..', 'packages');

// Required fields from metadata_schema.json
const REQUIRED_FIELDS = ['packageId', 'name', 'version', 'description'];

// Version regex from schema (semver pattern)
const VERSION_REGEX = /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;

// PackageId regex from schema (snake_case or kebab-case)
const PACKAGE_ID_REGEX = /^[a-z][a-z0-9_-]*$/;

/**
 * Validate a single metadata object
 */
function validateMetadata(packageId, metadata, filePath) {
  const errors = [];
  
  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!metadata[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate packageId format
  if (metadata.packageId && !PACKAGE_ID_REGEX.test(metadata.packageId)) {
    errors.push(`Invalid packageId format: "${metadata.packageId}" (must be snake_case or kebab-case)`);
  }
  
  // Validate packageId matches directory name
  if (metadata.packageId && metadata.packageId !== packageId) {
    errors.push(`PackageId mismatch: metadata says "${metadata.packageId}" but directory is "${packageId}"`);
  }
  
  // Validate version format (semver)
  if (metadata.version && !VERSION_REGEX.test(metadata.version)) {
    errors.push(`Invalid version format: "${metadata.version}" (must be semver like "1.0.0")`);
  }
  
  // Check field types
  if (metadata.name && typeof metadata.name !== 'string') {
    errors.push(`Field "name" must be a string`);
  }
  
  if (metadata.description && typeof metadata.description !== 'string') {
    errors.push(`Field "description" must be a string`);
  }
  
  if (metadata.dependencies && !Array.isArray(metadata.dependencies)) {
    errors.push(`Field "dependencies" must be an array`);
  }
  
  return errors;
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Validating package metadata files...\n');
  
  // Get all package directories
  const packageDirs = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();
  
  let valid = 0;
  let invalid = 0;
  let missing = 0;
  const allErrors = [];
  
  for (const packageId of packageDirs) {
    const metadataPath = path.join(PACKAGES_DIR, packageId, 'seed', 'metadata.json');
    
    // Check if metadata.json exists
    if (!fs.existsSync(metadataPath)) {
      console.log(`❌ ${packageId}: metadata.json not found`);
      missing++;
      allErrors.push({ packageId, errors: ['File not found'] });
      continue;
    }
    
    try {
      // Read and parse metadata
      const content = fs.readFileSync(metadataPath, 'utf-8');
      const metadata = JSON.parse(content);
      
      // Validate
      const errors = validateMetadata(packageId, metadata, metadataPath);
      
      if (errors.length === 0) {
        console.log(`✅ ${packageId}: Valid`);
        valid++;
      } else {
        console.log(`❌ ${packageId}: ${errors.length} error(s)`);
        errors.forEach(err => console.log(`   - ${err}`));
        invalid++;
        allErrors.push({ packageId, errors });
      }
      
    } catch (error) {
      console.log(`❌ ${packageId}: Parse error - ${error.message}`);
      invalid++;
      allErrors.push({ packageId, errors: [error.message] });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Validation Summary:');
  console.log(`   ✅ Valid: ${valid}`);
  console.log(`   ❌ Invalid: ${invalid}`);
  console.log(`   🚫 Missing: ${missing}`);
  console.log(`   📦 Total: ${packageDirs.length}`);
  console.log('='.repeat(60));
  
  if (invalid > 0 || missing > 0) {
    console.log('\n❌ Validation failed!');
    console.log(`\nPackages with errors (${allErrors.length}):`);
    allErrors.forEach(({ packageId, errors }) => {
      console.log(`\n${packageId}:`);
      errors.forEach(err => console.log(`  - ${err}`));
    });
    process.exit(1);
  } else {
    console.log('\n✅ All metadata files are valid!');
  }
}

// Run the script
main();
