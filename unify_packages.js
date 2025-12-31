const fs = require('fs');

const packages = fs.readdirSync('packages').filter(f => fs.statSync('packages/' + f).isDirectory());

const fixes = {
  'css_designer': { icon: 'static_content/icon.svg' },
  'dbal_demo': { icon: 'static_content/icon.svg' },
  'github_tools': {
    icon: 'static_content/icon.svg',
    devDependencies: ['lua_test'],
    tests: {
      scripts: ['tests/metadata.test.lua'],
      cases: ['tests/metadata.cases.json']
    }
  },
  'lua_test': {
    devDependencies: [],
    tests: {
      scripts: ['tests/metadata.test.lua'],
      cases: ['tests/metadata.cases.json']
    }
  },
  'media_center': {
    icon: 'static_content/icon.svg',
    devDependencies: ['lua_test']
  },
  'quick_guide': {
    tests: {
      scripts: ['tests/metadata.test.lua'],
      cases: ['tests/metadata.cases.json']
    }
  },
  'screenshot_analyzer': {
    icon: 'static_content/icon.svg'
  },
  'shared': {
    icon: 'static_content/icon.svg',
    devDependencies: [],
    tests: {
      scripts: ['tests/metadata.test.lua'],
      cases: ['tests/metadata.cases.json']
    }
  }
};

Object.keys(fixes).forEach(pkg => {
  const metaPath = 'packages/' + pkg + '/seed/metadata.json';
  if (!fs.existsSync(metaPath)) {
    console.log('SKIP:', pkg, '- metadata not found');
    return;
  }

  const data = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

  // Add missing fields
  Object.keys(fixes[pkg]).forEach(field => {
    if (!data[field]) {
      data[field] = fixes[pkg][field];
      console.log('ADD:', pkg, '-', field);
    }
  });

  // Write back
  fs.writeFileSync(metaPath, JSON.stringify(data, null, 2) + '\n');
  console.log('✓', pkg);
});

console.log('\nDone!');
