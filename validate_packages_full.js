const fs = require('fs');
const path = require('path');

const packages = fs.readdirSync('packages').filter(f => fs.statSync('packages/' + f).isDirectory());

// Required fields according to gold standard
const REQUIRED_FIELDS = ['packageId', 'name', 'version', 'description', 'author', 'category', 'minLevel', 'primary'];
const STANDARD_FIELDS = ['icon', 'dependencies', 'devDependencies', 'exports', 'permissions', 'seed', 'storybook'];
const RECOMMENDED_FIELDS = ['tests'];

let totalErrors = 0;
let totalWarnings = 0;
let packageStats = {
  valid: 0,
  withWarnings: 0,
  withErrors: 0
};

console.log('🔍 MetaBuilder Package Validator\n');
console.log('Validating ' + packages.length + ' packages...\n');

packages.forEach(pkg => {
  const metaPath = path.join('packages', pkg, 'seed', 'metadata.json');

  if (!fs.existsSync(metaPath)) {
    console.log('❌', pkg.padEnd(30), 'No metadata.json found');
    totalErrors++;
    packageStats.withErrors++;
    return;
  }

  let data;
  try {
    const content = fs.readFileSync(metaPath, 'utf8');
    data = JSON.parse(content);
  } catch (e) {
    console.log('❌', pkg.padEnd(30), 'Invalid JSON:', e.message);
    totalErrors++;
    packageStats.withErrors++;
    return;
  }

  const errors = [];
  const warnings = [];

  // Validate required fields
  REQUIRED_FIELDS.forEach(field => {
    if (!(field in data)) {
      errors.push('Missing required field: ' + field);
    }
  });

  // Validate packageId matches directory name
  if (data.packageId && data.packageId !== pkg) {
    errors.push('packageId "' + data.packageId + '" does not match directory name "' + pkg + '"');
  }

  // Validate packageId format (lowercase with underscores only)
  if (data.packageId && !/^[a-z][a-z0-9_]*$/.test(data.packageId)) {
    errors.push('packageId must be lowercase with underscores only');
  }

  // Validate version format (semantic versioning)
  if (data.version && !/^\d+\.\d+\.\d+$/.test(data.version)) {
    errors.push('version must follow semantic versioning (X.Y.Z)');
  }

  // Validate minLevel range
  if (data.minLevel !== undefined && (data.minLevel < 0 || data.minLevel > 6)) {
    errors.push('minLevel must be between 0 and 6');
  }

  // Validate primary is boolean
  if (data.primary !== undefined && typeof data.primary !== 'boolean') {
    errors.push('primary must be a boolean');
  }

  // Validate exports structure
  if (data.exports) {
    if (Array.isArray(data.exports)) {
      errors.push('exports must be an object, not an array');
    } else if (typeof data.exports === 'object') {
      // Validate exports has at least one valid key
      const validKeys = ['scripts', 'components', 'pages', 'types', 'layouts', 'luaScripts'];
      const hasValidKey = Object.keys(data.exports).some(key => validKeys.includes(key));

      if (!hasValidKey) {
        warnings.push('exports should have at least one of: ' + validKeys.join(', '));
      }

      // Validate each export type is an array
      Object.keys(data.exports).forEach(key => {
        if (!Array.isArray(data.exports[key])) {
          errors.push('exports.' + key + ' must be an array');
        }
      });
    }
  }

  // Validate storybook structure
  if (data.storybook) {
    if (!data.storybook.stories) {
      errors.push('storybook must have a stories array');
    } else if (!Array.isArray(data.storybook.stories)) {
      errors.push('storybook.stories must be an array');
    } else {
      // Validate each story has name and render
      data.storybook.stories.forEach((story, idx) => {
        if (!story.name) {
          errors.push('storybook.stories[' + idx + '] missing name');
        }
        if (!story.render) {
          errors.push('storybook.stories[' + idx + '] missing render');
        }
      });
    }
  }

  // Validate dependencies are arrays
  if (data.dependencies && !Array.isArray(data.dependencies)) {
    errors.push('dependencies must be an array');
  }
  if (data.devDependencies && !Array.isArray(data.devDependencies)) {
    errors.push('devDependencies must be an array');
  }

  // Check for standard fields
  STANDARD_FIELDS.forEach(field => {
    if (!(field in data)) {
      warnings.push('Missing standard field: ' + field);
    }
  });

  // Check for recommended fields
  RECOMMENDED_FIELDS.forEach(field => {
    if (!(field in data)) {
      warnings.push('Missing recommended field: ' + field);
    }
  });

  // Validate tests structure if present
  if (data.tests) {
    if (!data.tests.scripts && !data.tests.cases && !data.tests.unit && !data.tests.integration) {
      warnings.push('tests object should have scripts, cases, unit, or integration arrays');
    }
  }

  // Validate permissions structure
  if (data.permissions) {
    Object.keys(data.permissions).forEach(permKey => {
      const perm = data.permissions[permKey];
      if (typeof perm !== 'object') {
        errors.push('permissions.' + permKey + ' must be an object');
      } else {
        if (!('minLevel' in perm)) {
          warnings.push('permissions.' + permKey + ' should have minLevel');
        }
        if (!('description' in perm)) {
          warnings.push('permissions.' + permKey + ' should have description');
        }
      }
    });
  }

  // Report results
  if (errors.length > 0) {
    console.log('❌', pkg.padEnd(30), errors.length + ' error(s)');
    errors.forEach(err => console.log('   ↳', err));
    totalErrors += errors.length;
    packageStats.withErrors++;
  } else if (warnings.length > 0) {
    console.log('⚠️ ', pkg.padEnd(30), warnings.length + ' warning(s)');
    if (process.argv.includes('--verbose')) {
      warnings.forEach(warn => console.log('   ↳', warn));
    }
    totalWarnings += warnings.length;
    packageStats.withWarnings++;
  } else {
    console.log('✅', pkg.padEnd(30), 'Valid');
    packageStats.valid++;
  }
});

console.log('\n' + '='.repeat(80));
console.log('📊 Validation Summary:');
console.log('='.repeat(80));
console.log('  ✅ Valid packages:        ', packageStats.valid.toString().padStart(3), '(' + Math.round(packageStats.valid / packages.length * 100) + '%)');
console.log('  ⚠️  Packages with warnings:', packageStats.withWarnings.toString().padStart(3), '(' + Math.round(packageStats.withWarnings / packages.length * 100) + '%)');
console.log('  ❌ Packages with errors:  ', packageStats.withErrors.toString().padStart(3), '(' + Math.round(packageStats.withErrors / packages.length * 100) + '%)');
console.log('  📦 Total packages:        ', packages.length.toString().padStart(3));
console.log('  ⚠️  Total warnings:       ', totalWarnings.toString().padStart(3));
console.log('  ❌ Total errors:          ', totalErrors.toString().padStart(3));
console.log('='.repeat(80));

if (totalErrors === 0 && totalWarnings === 0) {
  console.log('🎉 All packages are valid!');
  process.exit(0);
} else if (totalErrors === 0) {
  console.log('✅ All packages pass validation (some have minor warnings)');
  console.log('💡 Run with --verbose to see warnings');
  process.exit(0);
} else {
  console.log('❌ Validation failed - please fix errors above');
  process.exit(1);
}
