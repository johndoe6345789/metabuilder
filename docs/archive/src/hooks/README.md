# React Hooks

## Overview
Custom React hooks for common functionality across the application.

## Location
[/src/hooks/](/src/hooks/)

## Available Hooks

### useMobile
- **File**: `use-mobile.ts`
- **Purpose**: Detects mobile device viewport and provides responsive behavior
- **Returns**: Boolean indicating if device is mobile

### useDBAL
- **File**: `useDBAL.ts`
- **Purpose**: Provides access to DBAL (Data Abstraction Layer) for database queries
- **Returns**: DBAL client instance with query methods

### useKV
- **File**: `useKV.ts`
- **Purpose**: Key-value storage hook for component-level state or cached data
- **Returns**: Object with get/set/delete methods for key-value operations

## Usage Examples

```typescript
import { useMobile } from '@/hooks/use-mobile'
import { useDBAL } from '@/hooks/useDBAL'
import { useKV } from '@/hooks/useKV'

// Mobile detection
const isMobile = useMobile()

// Database access
const dbal = useDBAL()
const data = await dbal.query(...)

// Key-value storage
const kv = useKV()
kv.set('key', value)
const value = kv.get('key')
```

## Related Documentation
- [React Component Architecture](/docs/architecture)
