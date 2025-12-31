const fs = require('fs');

const packages = fs.readdirSync('packages').filter(f => fs.statSync('packages/' + f).isDirectory());

const issues = [];

packages.forEach(pkg => {
  const metaPath = 'packages/' + pkg + '/seed/metadata.json';
  if (!fs.existsSync(metaPath)) return;

  const data = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const missing = [];

  if (!data.icon) missing.push('icon');
  if (!data.devDependencies || data.devDependencies.length === 0) missing.push('devDependencies');
  if (!data.tests) missing.push('tests');
  if (!data.exports || typeof data.exports !== 'object' || Array.isArray(data.exports)) missing.push('exports(object)');

  if (missing.length > 0) {
    console.log(pkg.padEnd(25), 'Missing:', missing.join(', '));
  }
});
