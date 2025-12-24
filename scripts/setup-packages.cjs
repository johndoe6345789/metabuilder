#!/usr/bin/env node

'use strict';

/**
 * Setup script for creating package folder structure
 * Usage: 
 *   node scripts/setup-packages.cjs <package-name>  - Create a specific package
 *   node scripts/setup-packages.cjs                  - Verify all required packages exist
 */

const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '..', 'packages');

// Get package name from command line argument
const packageName = process.argv[2];

// Package definitions
const packageTemplates = {
  'admin_dialog': {
    id: 'admin_dialog',
    name: 'Admin Dialog',
    description: 'Admin dialog components',
    hasExamples: true
  },
  'data_table': {
    id: 'data_table',
    name: 'Data Table',
    description: 'Data table components',
    hasExamples: true
  },
  'form_builder': {
    id: 'form_builder',
    name: 'Form Builder',
    description: 'Form builder components',
    hasExamples: true
  },
  'nav_menu': {
    id: 'nav_menu',
    name: 'Navigation Menu',
    description: 'Navigation menu components',
    hasExamples: false
  },
  'dashboard': {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Dashboard components',
    hasExamples: false
  },
  'notification_center': {
    id: 'notification_center',
    name: 'Notification Center',
    description: 'Notification center components',
    hasExamples: false
  }
};

function createPackage(pkg) {
  const pkgDir = path.join(packagesDir, pkg.id);
  const seedDir = path.join(pkgDir, 'seed');
  
  // Create directories
  if (!fs.existsSync(packagesDir)) {
    fs.mkdirSync(packagesDir, { recursive: true });
  }
  
  if (!fs.existsSync(seedDir)) {
    fs.mkdirSync(seedDir, { recursive: true });
  }
  
  // Create components.json
  const componentsPath = path.join(seedDir, 'components.json');
  if (!fs.existsSync(componentsPath)) {
    fs.writeFileSync(componentsPath, '[]', 'utf8');
  }
  
  // Create metadata.json
  const metadataPath = path.join(seedDir, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    const metadata = {
      packageId: pkg.id,
      name: pkg.name,
      version: '1.0.0',
      description: pkg.description,
      author: 'MetaBuilder',
      category: 'ui',
      dependencies: [],
      exports: {
        components: []
      }
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  }
  
  // Create examples.json if needed
  if (pkg.hasExamples) {
    const staticDir = path.join(pkgDir, 'static_content');
    if (!fs.existsSync(staticDir)) {
      fs.mkdirSync(staticDir, { recursive: true });
    }
    
    const examplesPath = path.join(staticDir, 'examples.json');
    if (!fs.existsSync(examplesPath)) {
      fs.writeFileSync(examplesPath, '{}', 'utf8');
    }
  }
  
  console.log(`✓ Created ${pkg.name} package`);
}

// If a specific package name is provided
if (packageName) {
  const pkg = packageTemplates[packageName];
  
  if (!pkg) {
    console.error(`Error: Unknown package '${packageName}'`);
    console.log('\nAvailable packages:');
    Object.keys(packageTemplates).forEach(key => {
      console.log(`  - ${key}`);
    });
    process.exit(1);
  }
  
  // Check if package already exists
  const pkgDir = path.join(packagesDir, pkg.id);
  if (fs.existsSync(pkgDir)) {
    console.log(`✓ Package '${pkg.name}' already exists`);
    process.exit(0);
  }
  
  console.log(`Creating package: ${pkg.name}...\n`);
  createPackage(pkg);
  console.log('\n✅ Package created successfully!');
} else {
  // No package name provided - verification mode (postinstall or manual check)
  // Verify that all required packages exist
  const requiredPackages = Object.keys(packageTemplates);
  const missingPackages = [];
  
  if (!fs.existsSync(packagesDir)) {
    console.error('Error: packages folder does not exist!');
    console.log('Run this script with a package name to create packages.');
    process.exit(1);
  }
  
  for (const pkgId of requiredPackages) {
    const componentsPath = path.join(packagesDir, pkgId, 'seed', 'components.json');
    const metadataPath = path.join(packagesDir, pkgId, 'seed', 'metadata.json');
    
    if (!fs.existsSync(componentsPath) || !fs.existsSync(metadataPath)) {
      missingPackages.push(pkgId);
    }
  }
  
  if (missingPackages.length > 0) {
    console.error('Error: Missing required packages:', missingPackages.join(', '));
    console.log('\nCreate missing packages with:');
    missingPackages.forEach(pkg => {
      console.log(`  npm run setup-packages ${pkg}`);
    });
    process.exit(1);
  }
  
  console.log('✓ All required packages exist and are committed to the repository.');
}

