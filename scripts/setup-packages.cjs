#!/usr/bin/env node

/**
 * Setup script for creating the packages folder structure
 * This creates placeholder files for all packages referenced in package-glue.ts
 */

const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '..', 'packages');

// Package definitions
const packages = [
  {
    id: 'admin_dialog',
    name: 'Admin Dialog',
    description: 'Admin dialog components',
    hasExamples: true
  },
  {
    id: 'data_table',
    name: 'Data Table',
    description: 'Data table components',
    hasExamples: true
  },
  {
    id: 'form_builder',
    name: 'Form Builder',
    description: 'Form builder components',
    hasExamples: true
  },
  {
    id: 'nav_menu',
    name: 'Navigation Menu',
    description: 'Navigation menu components',
    hasExamples: false
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Dashboard components',
    hasExamples: false
  },
  {
    id: 'notification_center',
    name: 'Notification Center',
    description: 'Notification center components',
    hasExamples: false
  }
];

console.log('Setting up packages folder...\n');

// Create packages directory if it doesn't exist
if (!fs.existsSync(packagesDir)) {
  fs.mkdirSync(packagesDir, { recursive: true });
  console.log('✓ Created packages directory');
}

// Create each package
packages.forEach(pkg => {
  const pkgDir = path.join(packagesDir, pkg.id);
  const seedDir = path.join(pkgDir, 'seed');
  
  // Create directories
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
  
  console.log(`✓ Set up ${pkg.name} package`);
});

// Create README
const readmePath = path.join(packagesDir, 'README.md');
if (!fs.existsSync(readmePath)) {
  const readmeContent = `# Packages Folder

This folder contains modular packages for the MetaBuilder application. Each package is self-contained with its own components, metadata, and examples.

## Structure

Each package follows this structure:

\`\`\`
packages/
  ├── package_name/
  │   ├── seed/
  │   │   ├── components.json    # Component definitions
  │   │   ├── metadata.json      # Package metadata
  │   │   └── scripts/           # Optional Lua scripts
  │   └── static_content/
  │       └── examples.json      # Optional usage examples
\`\`\`

## Available Packages

- **admin_dialog**: Admin dialog components for management interfaces
- **data_table**: Data table components for displaying tabular data
- **form_builder**: Form builder components for creating dynamic forms
- **nav_menu**: Navigation menu components
- **dashboard**: Dashboard layout components
- **notification_center**: Notification center components

## Package Metadata Format

Each \`metadata.json\` file should contain:

\`\`\`json
{
  "packageId": "package_name",
  "name": "Display Name",
  "version": "1.0.0",
  "description": "Package description",
  "author": "Author name",
  "category": "ui",
  "dependencies": [],
  "exports": {
    "components": []
  }
}
\`\`\`

## Components Format

Each \`components.json\` file should contain an array of component definitions.

## Development

This folder is gitignored and serves as a local development structure. The main application imports from these packages via relative paths in \`src/lib/package-glue.ts\`.

To add a new package:

1. Create a new folder under \`packages/\`
2. Add required \`seed/components.json\` and \`seed/metadata.json\` files
3. Add optional \`static_content/examples.json\` if needed
4. Update \`src/lib/package-glue.ts\` to import the new package
`;
  fs.writeFileSync(readmePath, readmeContent, 'utf8');
  console.log('✓ Created README.md');
}

console.log('\n✅ Packages folder setup complete!');
console.log('Note: The packages folder is gitignored and will not be committed to the repository.');
