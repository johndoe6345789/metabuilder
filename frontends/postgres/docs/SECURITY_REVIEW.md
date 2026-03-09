# Code Review Findings & Security Considerations

## Overview
Code review identified 10 items requiring attention, primarily focused on security and type safety.

## Security Issues (High Priority)

### 1. Code Execution Vulnerability in ComponentTreeRenderer
**Location:** `src/utils/ComponentTreeRenderer.tsx` lines 91-131

**Issue:** Using `new Function()` with user-provided input allows arbitrary code execution.

**Risk:** An attacker could inject malicious JavaScript through template expressions.

**Example Attack:**
```json
{
  "props": {
    "text": "{{require('fs').readFileSync('/etc/passwd')}}"
  }
}
```

**Recommended Fix:**
- Use a safer expression evaluator (e.g., `expr-eval`, `safe-eval-2`)
- Implement a whitelist of allowed operations
- Sanitize all user inputs
- Run evaluations in a sandboxed environment

**Mitigation for Current Use:**
- features.json is server-side only (not user-editable)
- Only trusted developers can modify it
- Still should be fixed for production

### 2. SQL Injection Risk in Query Templates
**Location:** `src/config/features.json` line 2902 and throughout SQL templates

**Issue:** Template parameters like `{{tableName}}` are not escaped, potentially allowing SQL injection.

**Example Attack:**
```javascript
const tableName = "users; DROP TABLE users--";
interpolateSqlTemplate(template, { tableName });
// Result: CREATE TABLE "users; DROP TABLE users--" (...)
```

**Recommended Fix:**
- Use proper parameterized queries through Drizzle ORM
- Validate all identifiers (table names, column names) against whitelist
- Escape special characters in SQL identifiers
- Use pg_escape_identifier() or equivalent

**Current Mitigation:**
- API routes already validate table/column names
- Templates are for reference/documentation
- Actual queries should use Drizzle ORM

### 3. Missing Query Parameters in API Routes
**Location:** `src/app/api/admin/record/route.ts` lines 62, 124, 182

**Issue:** Queries contain placeholders ($1, $2, etc.) but no values are passed to `sql.raw()`.

**Impact:** Queries will fail at runtime - parameters won't be substituted.

**Fix Required:**
```typescript
// Current (broken):
const result = await db.execute(sql.raw(query));

// Should be:
const result = await db.execute(sql.raw(query), values);
```

**Status:** This was introduced during the refactoring fix. Need to revert or fix properly.

## Type Safety Issues (Medium Priority)

### 4. Loose Return Types in Storybook Functions
**Location:** `src/utils/featureConfig.ts` lines 496, 500, 504

**Issue:** Functions return `any` or `Record<string, any>` instead of proper types.

**Recommended Fix:**
```typescript
// Current:
export function getStorybookStory(componentName: string, storyName: string): any {

// Should be:
export function getStorybookStory(
  componentName: string, 
  storyName: string
): StorybookStory | undefined {
```

**Impact:** Loss of TypeScript type checking and IDE autocomplete.

## Security Best Practices

### For ComponentTreeRenderer

**Option 1: Use Safe Expression Evaluator**
```typescript
import { Parser } from 'expr-eval';

const parser = new Parser();
function evaluateCondition(condition: string, data: Record<string, any>): boolean {
  try {
    const expr = parser.parse(condition);
    return expr.evaluate(data);
  } catch {
    return false;
  }
}
```

**Option 2: Whitelist Approach**
```typescript
const ALLOWED_OPERATIONS = {
  '===': (a: any, b: any) => a === b,
  '>': (a: any, b: any) => a > b,
  '&&': (a: boolean, b: boolean) => a && b,
  // ... more operators
};

function evaluateSafe(expr: string, data: any): any {
  // Parse and evaluate using whitelist only
}
```

**Option 3: Static Analysis**
```typescript
// Only allow specific patterns
const SAFE_PATTERN = /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/;

function interpolateValue(value: string, data: any): any {
  const match = value.match(/^\{\{(.+)\}\}$/);
  if (match && SAFE_PATTERN.test(match[1])) {
    return getNestedProperty(data, match[1]);
  }
  return value;
}
```

### For SQL Templates

**Use Drizzle ORM Properly:**
```typescript
// Don't use sql.raw() with string concatenation
// ❌ Bad:
const query = `INSERT INTO "${tableName}" ...`;
await db.execute(sql.raw(query));

// ✅ Good:
await db.insert(table).values(data);

// ✅ Also Good (if raw SQL needed):
await db.execute(sql`
  INSERT INTO ${sql.identifier([tableName])}
  (${sql.join(columns, sql`, `)})
  VALUES (${sql.join(values, sql`, `)})
`);
```

**Validate Identifiers:**
```typescript
function validateIdentifier(name: string): boolean {
  // PostgreSQL identifier rules
  const VALID_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/;
  return VALID_IDENTIFIER.test(name);
}

function sanitizeIdentifier(name: string): string {
  if (!validateIdentifier(name)) {
    throw new Error('Invalid identifier');
  }
  return name;
}
```

## Recommendations

### Immediate Actions (Before Production)
1. ✅ Fix the parameterized query issue in record/route.ts
2. ✅ Implement safe expression evaluation in ComponentTreeRenderer
3. ✅ Add identifier validation to all SQL template usage
4. ✅ Improve TypeScript types in featureConfig.ts

### Code Review Actions
5. ✅ Security audit of all `new Function()` usage
6. ✅ Review all SQL query generation
7. ✅ Add input sanitization tests
8. ✅ Document security considerations

### Future Enhancements
9. ⚠️ Add Content Security Policy headers
10. ⚠️ Implement rate limiting on API endpoints
11. ⚠️ Add SQL query logging and monitoring
12. ⚠️ Create security testing suite

## Current Risk Assessment

**ComponentTreeRenderer Security:**
- **Risk Level:** Medium
- **Exposure:** Low (only server-side, trusted developers)
- **Mitigation:** features.json is not user-editable
- **Action Required:** Fix before allowing dynamic configuration

**SQL Template Security:**
- **Risk Level:** High
- **Exposure:** Medium (API endpoints accessible)
- **Mitigation:** Existing validation in API routes
- **Action Required:** Use proper Drizzle ORM methods

**Query Parameter Issue:**
- **Risk Level:** Critical (functionality broken)
- **Exposure:** High (affects all CRUD operations)
- **Mitigation:** None (runtime errors)
- **Action Required:** Immediate fix needed

## Conclusion

The refactoring successfully demonstrates the concept of configuration-driven UI development. However, the security issues identified must be addressed before production use:

1. **Critical:** Fix parameterized queries in record/route.ts
2. **High Priority:** Implement safe expression evaluation
3. **Medium Priority:** Improve type safety

The architecture is sound, but implementation needs security hardening.

## Testing Recommendations

Add security tests:
```typescript
describe('Security', () => {
  test('should reject malicious template expressions', () => {
    const malicious = "{{require('fs').readFileSync('/etc/passwd')}}";
    expect(() => interpolateValue(malicious, {})).toThrow();
  });

  test('should reject SQL injection attempts', () => {
    const malicious = "users; DROP TABLE users--";
    expect(() => validateIdentifier(malicious)).toThrow();
  });
});
```
