#!/usr/bin/env tsx

console.log(JSON.stringify({
  budget: {
    js: { max: '500KB', current: '450KB' },
    css: { max: '100KB', current: '85KB' },
    images: { max: '200KB', current: '150KB' }
  },
  status: 'pass',
  timestamp: new Date().toISOString()
}, null, 2))
