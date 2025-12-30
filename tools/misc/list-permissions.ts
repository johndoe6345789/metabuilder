#!/usr/bin/env tsx

import { PERMISSION_LEVELS } from '../frontends/nextjs/src/app/levels/levels-data'

const describeLevel = (level: typeof PERMISSION_LEVELS[number]) => {
  console.log(`Level ${level.id} · ${level.title}`)
  console.log(`  ${level.description}`)
  console.log('  Capabilities:')
  level.capabilities.forEach((capability) => console.log(`    - ${capability}`))
  console.log('')
}

const run = () => {
  console.log('Permission level catalog:')
  PERMISSION_LEVELS.forEach(describeLevel)
}

run()
