# Write Parameterized Tests

Run tests from `frontends/nextjs/`.

Add tests using the parameterized `it.each()` pattern:

```typescript
import { describe, it, expect } from 'vitest'

describe('myFunction', () => {
  it.each([
    { input: 'case1', expected: 'result1' },
    { input: 'case2', expected: 'result2' },
    { input: 'edge-case', expected: 'handled' },
  ])('should handle $input', ({ input, expected }) => {
    expect(myFunction(input)).toBe(expected)
  })
})
```

Place test files next to source: `utils.ts` → `utils.test.ts`

Run tests:
- `npm test` - Watch mode
- `npm run test:unit` - Single run
- `npm run test:coverage:report` - Generate coverage markdown
