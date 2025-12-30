#!/usr/bin/env tsx

import { PERMISSION_LEVELS } from '../frontends/nextjs/src/app/levels/levels-data'

const separators = PERMISSION_LEVELS.map((level) => [
  level.id,
  level.key,
  JSON.stringify(level.title),
  JSON.stringify(level.capabilities.join('; ')),
])

console.log(['id,key,title,capabilities', ...separators.map((row) => row.join(','))].join('\n'))
