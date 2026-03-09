#!/usr/bin/env node

import { QualityValidator } from './src/lib/quality-validator/index.js';

async function main() {
  const validator = new QualityValidator();

  const options = {
    format: 'console',
    verbose: true,
  };

  const exitCode = await validator.validate(options);
  process.exit(exitCode);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
