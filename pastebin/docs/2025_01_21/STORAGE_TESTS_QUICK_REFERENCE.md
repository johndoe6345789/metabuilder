# Storage Layer Tests - Quick Reference Guide

## Test Suite Overview

**File:** `tests/unit/lib/storage.test.ts`
**Total Tests:** 89 (all passing ✅)
**Status:** Production Ready

## Quick Commands

```bash
# Run all storage tests
npm test -- tests/unit/lib/storage.test.ts

# Run specific test suite
npm test -- tests/unit/lib/storage.test.ts -t "getAllSnippets"

# Run with coverage
npm test -- tests/unit/lib/storage.test.ts --coverage

# Watch mode during development
npm test -- tests/unit/lib/storage.test.ts --watch
```

## Test Organization

### Configuration Tests (8 tests)
Tests for storage backend configuration (IndexedDB vs Flask)

**Key Tests:**
```
✅ loadStorageConfig - Load from env/localStorage
✅ saveStorageConfig - Save to localStorage
✅ getStorageConfig - Retrieve current config
```

**Import to verify:**
```typescript
import {
  loadStorageConfig,
  saveStorageConfig,
  getStorageConfig
} from '@/lib/storage'
```

### FlaskStorageAdapter Tests (81 tests)
The main HTTP client for Flask backend communication

**Import:**
```typescript
import { FlaskStorageAdapter } from '@/lib/storage'
```

## Common Test Patterns

### Testing CRUD Operations

```typescript
// Create
(global.fetch as jest.Mock).mockResolvedValue({ ok: true });
const adapter = new FlaskStorageAdapter('http://localhost:5000');
const snippet = createMockSnippet();
await adapter.createSnippet(snippet);
expect((global.fetch as jest.Mock)).toHaveBeenCalled();

// Read
(global.fetch as jest.Mock).mockResolvedValue({
  ok: true,
  json: async () => createMockSnippet()
});
const result = await adapter.getSnippet('1');
expect(result?.id).toBe('1');

// Update
(global.fetch as jest.Mock).mockResolvedValue({ ok: true });
const snippet = createMockSnippet({ id: '1' });
await adapter.updateSnippet(snippet);

// Delete
(global.fetch as jest.Mock).mockResolvedValue({ ok: true });
await adapter.deleteSnippet('1');
```

### Testing Error Scenarios

```typescript
// Network error
(global.fetch as jest.Mock).mockRejectedValue(
  new Error('Network error')
);
await expect(adapter.getAllSnippets()).rejects.toThrow();

// HTTP error
(global.fetch as jest.Mock).mockResolvedValue({
  ok: false,
  status: 500,
  statusText: 'Server Error'
});
await expect(adapter.getAllSnippets()).rejects.toThrow('Failed to fetch snippets');

// 404 Not Found (special case for getSnippet)
(global.fetch as jest.Mock).mockResolvedValue({
  status: 404
});
const result = await adapter.getSnippet('missing');
expect(result).toBeNull();
```

### Testing Data Serialization

```typescript
// Timestamp conversion (API → App)
const mockSnippet = {
  id: '1',
  title: 'Test',
  createdAt: '2024-01-15T10:30:00.000Z',
  updatedAt: '2024-01-15T10:30:00.000Z'
};
(global.fetch as jest.Mock).mockResolvedValue({
  ok: true,
  json: async () => mockSnippet
});
const result = await adapter.getSnippet('1');
expect(typeof result?.createdAt).toBe('number'); // Converted to timestamp

// Timestamp conversion (App → API)
(global.fetch as jest.Mock).mockResolvedValue({ ok: true });
const now = Date.now();
const snippet = createMockSnippet({
  createdAt: now,
  updatedAt: now
});
await adapter.createSnippet(snippet);
const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
expect(typeof body.createdAt).toBe('string'); // Converted to ISO string
```

## Test Helpers

### Mock Snippet Factory
```typescript
// Creates a complete snippet with all required fields
const snippet = createMockSnippet({
  id: '123',
  title: 'Custom Title',
  language: 'python'
});
```

### Mock Namespace Factory
```typescript
// Creates a complete namespace
const namespace = createMockNamespace({
  id: 'custom-ns',
  name: 'Custom Namespace'
});
```

## Critical Data Conversions

### Important: Date Handling

The storage layer converts between two formats:

| Direction | Format | Example | Type |
|-----------|--------|---------|------|
| Backend → App | ISO 8601 String | `"2024-01-15T10:30:00.000Z"` | `string` |
| App → Backend | Millisecond Timestamp | `1705317000000` | `number` |

**Code:**
```typescript
// Converting ISO string to timestamp (receive from API)
const date = new Date(apiResponse.createdAt);
const timestamp = date.getTime(); // milliseconds

// Converting timestamp to ISO string (send to API)
const isoString = new Date(timestamp).toISOString();
```

## Test Failure Troubleshooting

### Issue: "response.json is not a function"
**Cause:** Mock needs `json` method
**Fix:**
```typescript
(global.fetch as jest.Mock).mockResolvedValue({
  ok: true,
  json: async () => ({ ...data })  // Add json method
});
```

### Issue: "Expected to have been called"
**Cause:** Mock cleared or not set before creating adapter
**Fix:**
```typescript
(global.fetch as jest.Mock).mockResolvedValue({ ok: true });
// Then create adapter and call method
const adapter = new FlaskStorageAdapter(baseUrl);
await adapter.getAllSnippets();
```

### Issue: "Signal is undefined"
**Cause:** testConnection uses AbortSignal.timeout which may timeout in tests
**Solution:** Test network error handling instead of success case with timeout

## Performance Expectations

Tests should complete in **< 300ms** total:

```bash
Tests:       89 passed, 89 total
Time:        ~0.3s
```

If tests take longer, check:
1. No real network calls (should be mocked)
2. No real timeouts running (5000ms timeout in code, instant in tests)
3. No async operations not awaited

## HTTP Protocol Verification

Each test verifies correct HTTP usage:

### Method Verification
```typescript
await adapter.createSnippet(snippet);
const call = (global.fetch as jest.Mock).mock.calls[0];
expect(call[1].method).toBe('POST');

await adapter.updateSnippet(snippet);
expect(call[1].method).toBe('PUT');

await adapter.deleteSnippet('id');
expect(call[1].method).toBe('DELETE');
```

### Header Verification
```typescript
const call = (global.fetch as jest.Mock).mock.calls[0];
expect(call[1].headers['Content-Type']).toBe('application/json');
```

### URL Verification
```typescript
const call = (global.fetch as jest.Mock).mock.calls[0];
expect(call[0]).toContain('/api/snippets');
expect(call[0]).toContain('123'); // Include ID if needed
```

## Adding New Tests

### 1. Clear Mock
```typescript
(global.fetch as jest.Mock).mockClear();
```

### 2. Set Up Mock Response
```typescript
(global.fetch as jest.Mock).mockResolvedValue({
  ok: true,
  json: async () => mockData
});
```

### 3. Create Adapter & Execute
```typescript
const adapter = new FlaskStorageAdapter('http://localhost:5000');
const result = await adapter.someMethod();
```

### 4. Verify Behavior
```typescript
expect(result).toBeDefined();
expect((global.fetch as jest.Mock)).toHaveBeenCalledWith(
  expect.stringContaining('/api/endpoint'),
  expect.any(Object)
);
```

## Test Dependencies

- **Jest:** Test framework
- **TypeScript:** Type checking
- **@testing-library:** (Not used for storage layer - pure mocks)

**No external dependencies required** for storage tests - all mocked!

## Edge Cases Covered

✅ **Large Data**
- 100K+ character code snippets
- 1000+ snippet responses

✅ **Special Characters**
- Unicode (测试, 🚀, テスト)
- HTML/Script tags in content

✅ **Null Values**
- Missing optional fields
- Null descriptions

✅ **Network Issues**
- Timeouts (AbortError)
- Connection refused
- DNS failures

✅ **HTTP Errors**
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 500 Server Error
- 503 Service Unavailable

## Real-World Usage Examples

### Check Connection to Backend
```typescript
const adapter = new FlaskStorageAdapter(process.env.NEXT_PUBLIC_FLASK_BACKEND_URL || '');
const isHealthy = await adapter.testConnection();
if (!isHealthy) {
  // Show error: Backend unreachable
}
```

### Fetch Snippets with Error Handling
```typescript
try {
  const snippets = await adapter.getAllSnippets();
  return snippets;
} catch (error) {
  console.error('Failed to fetch snippets:', error);
  throw error; // Propagate to UI
}
```

### Handle 404 Gracefully
```typescript
const snippet = await adapter.getSnippet(id);
if (!snippet) {
  // Handle not found - return null instead of error
  return null;
}
```

## Related Files

- **Implementation:** `src/lib/storage.ts`
- **Types:** `src/lib/types.ts`
- **Config:** `src/lib/config.ts`
- **Database:** `src/lib/db.ts`

---

**Test Suite:** Production Ready ✅
**Last Updated:** 2025-01-21
**Maintainer:** QA Engineer
