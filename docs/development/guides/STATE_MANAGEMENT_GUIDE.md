# 🎭 State Management Consolidation Guide

**Document Date:** December 25, 2025  
**Purpose:** Unified strategy for scattered state across components, context, and database  
**Target:** Consistent, testable, debuggable state patterns

---

## 🎯 Current Situation

### State Scatter Map
```
Component State (useState)        [LOCAL]
├─ UI state (expanded, focused)
├─ Form inputs
├─ Modal open/closed
└─ Temporary data

Context API                       [GLOBAL]
├─ Auth context
├─ Theme context
├─ User settings
└─ Notifications

Database State (Prisma)           [PERSISTENT]
├─ User data
├─ Configuration
├─ Preferences
└─ Audit logs

Third-party Libraries             [EXTERNAL]
├─ React Query (caching)
├─ React Hook Form (forms)
├─ Redux (if used)
└─ Zustand (if used)
```

**Problems:**
1. ❌ No clear decision criteria → inconsistent choices
2. ❌ Overlapping patterns → duplicate state
3. ❌ No caching strategy → unnecessary database calls
4. ❌ Context sprawl → 10+ providers
5. ❌ No clear data flow → hard to debug

---

## ✅ Unified State Architecture

### 4 State Categories

```
┌─────────────────────────────────────────────────────────┐
│ STATE MANAGEMENT HIERARCHY                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CATEGORY 1: LOCAL STATE (useState)                     │
│  Duration: Session                                      │
│  Scope: Single component                                │
│  Persistence: None                                      │
│  Max items: 2-3 per component                           │
│  ✓ UI toggles, temporary form data                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CATEGORY 2: GLOBAL STATE (Context)                     │
│  Duration: Session                                      │
│  Scope: Entire app                                      │
│  Persistence: Session storage                           │
│  Max providers: 3-4                                     │
│  ✓ Auth, theme, notifications                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CATEGORY 3: DATABASE STATE (Prisma + React)           │
│  Duration: Permanent                                    │
│  Scope: Multi-session                                   │
│  Persistence: Database                                  │
│  ✓ User data, configs, preferences                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CATEGORY 4: CACHE STATE (React Query)                 │
│  Duration: Temporary with invalidation                  │
│  Scope: Single or multiple components                   │
│  Persistence: Memory                                    │
│  ✓ API responses, expensive queries                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Decision Tree

```
START: I need to store some data

    Is this data user-specific or tenant-specific?
    ├─ NO → Is it needed globally across the app?
    │      ├─ NO → LOCAL STATE (useState)
    │      │       └─ Keep it simple, short-lived
    │      └─ YES → Is it frequently accessed?
    │              ├─ YES → GLOBAL STATE (Context)
    │              │        └─ Auth, theme, settings
    │              └─ NO → CACHE STATE (React Query)
    │                      └─ Fetch once, reuse
    │
    └─ YES → Will it outlive the current session?
            ├─ NO → LOCAL STATE or CACHE
            │       └─ Temporary user interactions
            └─ YES → DATABASE STATE (Prisma)
                    └─ Save to DB, load on app start
```

---

## 1️⃣ LOCAL STATE: useState

### Definition
Ephemeral state that lives only during current component render cycle.

### When to Use
```typescript
// ✅ DO: Use for UI state
const [isExpanded, setIsExpanded] = useState(false);
const [activeTab, setActiveTab] = useState(0);
const [hoverIndex, setHoverIndex] = useState(-1);

// ✅ DO: Use for form inputs before submission
const [firstName, setFirstName] = useState('');
const [email, setEmail] = useState('');

// ✅ DO: Use for temporary data
const [searchResults, setSearchResults] = useState([]);

// ❌ DON'T: Use for data that should persist
const [userPreferences, setUserPreferences] = useState({});
// → Move to DATABASE STATE

// ❌ DON'T: Use for app-wide settings
const [isDarkMode, setIsDarkMode] = useState(false);
// → Move to GLOBAL STATE or DATABASE STATE

// ❌ DON'T: Duplicate server state locally
const [userData, setUserData] = useState(null);
// → Use CACHE STATE with React Query
```

### Patterns

**Simple Toggle:**
```typescript
export function AccordionItem({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '▼' : '▶'} {title}
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}
```

**Form Inputs:**
```typescript
export function UserForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ name, email });
      setName(''); // Clear after submit
      setEmail('');
    }}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Multiple Related States (Use Object):**
```typescript
export function Modal() {
  const [state, setState] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    size: { width: 500, height: 300 },
  });

  const setIsOpen = (isOpen) =>
    setState((s) => ({ ...s, isOpen }));

  const setPosition = (position) =>
    setState((s) => ({ ...s, position }));

  // ... use state.isOpen, setIsOpen, setPosition
}
```

### Limits
- **Max per component:** 2-3 items
- **Max data size:** < 1 KB
- **Duration:** Current session only
- **Scope:** Single component only

---

## 2️⃣ GLOBAL STATE: Context API

### Definition
Application-wide state shared across many components without prop drilling.

### When to Use
```typescript
// ✅ DO: Authentication context
const AuthContext = createContext();
// → User data, tokens, login/logout functions

// ✅ DO: Theme context
const ThemeContext = createContext();
// → Dark/light mode, color scheme

// ✅ DO: Notifications context
const NotificationsContext = createContext();
// → Toast/alert messages, dismissal

// ❌ DON'T: Component-specific state
// → Keep in component with useState

// ❌ DON'T: Frequently changing data
// → Use CACHE STATE instead, Context updates = expensive re-renders

// ❌ DON'T: Server state
// → Use CACHE STATE with React Query
```

### Maximum 3-4 Global Contexts

```
┌─ AuthContext
│  ├─ user
│  ├─ isAuthenticated
│  └─ login/logout
├─ ThemeContext
│  ├─ isDarkMode
│  └─ setDarkMode
├─ NotificationsContext
│  ├─ notifications[]
│  ├─ addNotification
│  └─ removeNotification
└─ (Optional) SettingsContext
   ├─ userSettings
   └─ updateSettings
```

**Never add:**
- ❌ Global component visibility state
- ❌ Global form state
- ❌ Global selection state
- ❌ Global search state

---

### Pattern: AuthContext

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from session storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.user);
      sessionStorage.setItem('user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Usage in components:**
```typescript
export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Not logged in</div>;
  }

  return (
    <header>
      <span>Welcome, {user?.name}</span>
      <button onClick={logout}>Logout</button>
    </header>
  );
}
```

---

## 3️⃣ DATABASE STATE: Prisma + React State

### Definition
Persistent data stored in database, loaded into React state, cached during session.

### When to Use
```typescript
// ✅ DO: User preferences
const [userPrefs, setUserPrefs] = useState<UserPreferences | null>(null);
useEffect(() => {
  Database.getUserPreferences(userId).then(setUserPrefs);
}, [userId]);

// ✅ DO: Configuration data
const [config, setConfig] = useState<Config | null>(null);
useEffect(() => {
  Database.getConfig(tenantId).then(setConfig);
}, [tenantId]);

// ✅ DO: Lists of items from database
const [items, setItems] = useState<Item[]>([]);
useEffect(() => {
  Database.getItems(tenantId).then(setItems);
}, [tenantId]);

// ❌ DON'T: Cache without React Query
// → Too complex to manage updates/refetch

// ❌ DON'T: Forget tenantId in queries
const items = await Database.getItems(); // ❌ WRONG
const items = await Database.getItems({ tenantId }); // ✅ RIGHT
```

### Pattern: Database State Hook

```typescript
// src/hooks/useUserPreferences.ts
export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

export function useUserPreferences(userId: string) {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load preferences on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await Database.getUserPreferences(userId);
        setPrefs(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  // Update preferences (write-through cache)
  const updatePrefs = useCallback(
    async (updates: Partial<UserPreferences>) => {
      try {
        const updated = await Database.updateUserPreferences(userId, updates);
        setPrefs(updated);
      } catch (err) {
        setError(err as Error);
        // Revert optimistic update if it fails
        const current = await Database.getUserPreferences(userId);
        setPrefs(current);
      }
    },
    [userId]
  );

  return { prefs, loading, error, updatePrefs };
}
```

**Usage:**
```typescript
export function SettingsPanel() {
  const { user } = useAuth();
  const { prefs, loading, updatePrefs } = useUserPreferences(user.id);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <label>
        Dark Mode:
        <input
          type="checkbox"
          checked={prefs?.theme === 'dark'}
          onChange={(e) =>
            updatePrefs({ theme: e.target.checked ? 'dark' : 'light' })
          }
        />
      </label>
    </div>
  );
}
```

### Database Schema Example

```prisma
// prisma/schema.prisma

model UserPreferences {
  id          String @id @default(cuid())
  userId      String @unique
  user        User @relation(fields: [userId], references: [id])
  tenantId    String
  
  // Preferences data
  theme       String @default("light") // 'light' | 'dark'
  language    String @default("en")
  notifications Boolean @default(true)
  sidebarWidth Int @default(250)
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([userId, tenantId])
}
```

---

## 4️⃣ CACHE STATE: React Query

### Definition
Temporary cached state for API/database queries with automatic invalidation.

### When to Use
```typescript
// ✅ DO: API responses
const { data: workflows } = useQuery({
  queryKey: ['workflows', userId],
  queryFn: () => api.get(`/workflows?user=${userId}`),
});

// ✅ DO: Expensive database queries
const { data: analytics } = useQuery({
  queryKey: ['analytics', dateRange],
  queryFn: () => Database.getAnalytics(dateRange),
});

// ✅ DO: Frequently changing data
const { data: notifications } = useQuery({
  queryKey: ['notifications'],
  queryFn: () => api.get('/notifications'),
  refetchInterval: 5000, // Poll every 5 seconds
});

// ❌ DON'T: Use for always-fresh data
// → Use state + useEffect instead

// ❌ DON'T: Forget queryKey
const { data } = useQuery({
  queryFn: () => fetch('/api/data'),
  // ❌ No queryKey means no caching
});
```

### Pattern: React Query Hook

```typescript
// src/hooks/useWorkflows.ts
import { useQuery } from '@tanstack/react-query';

export function useWorkflows(userId: string) {
  return useQuery({
    queryKey: ['workflows', userId],
    queryFn: async () => {
      const response = await Database.getWorkflows({ userId });
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes cache
  });
}

export function useWorkflowDetails(workflowId: string) {
  return useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: async () => {
      return Database.getWorkflow(workflowId);
    },
    enabled: !!workflowId, // Don't fetch if no ID
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWorkflowData) =>
      Database.updateWorkflow(data),
    onSuccess: (newData) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['workflows'],
      });
      // Update specific query
      queryClient.setQueryData(['workflow', newData.id], newData);
    },
  });
}
```

**Usage:**
```typescript
export function WorkflowsList() {
  const { data: workflows, isLoading, error } = useWorkflows('user-123');
  const updateMutation = useUpdateWorkflow();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {workflows?.map((workflow) => (
        <div key={workflow.id}>
          <h3>{workflow.name}</h3>
          <button
            onClick={() =>
              updateMutation.mutate({
                id: workflow.id,
                status: 'paused',
              })
            }
            disabled={updateMutation.isPending}
          >
            Pause
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Setup QueryClient

```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

---

## 🔄 State Flow Diagram

```
┌─ USER ACTION (click, input, etc)
│
├─ LOCAL STATE (useState) ──────────→ Update immediately
│                                     └─ Re-render component
│
├─ GLOBAL STATE (Context) ──────────→ Update provider
│                                     └─ Re-render all consumers
│
├─ DATABASE STATE (Prisma + useState)
│  ├─ Read: Load on mount
│  │  └─ useState → Re-render
│  └─ Write: Save to DB
│     ├─ Optimistic update to state
│     ├─ Database operation
│     └─ Invalidate cache if fails
│
└─ CACHE STATE (React Query)
   ├─ Read: useQuery
   │  ├─ Return cached if fresh
   │  └─ Fetch if stale
   ├─ Write: useMutation
   │  ├─ Optimistic update
   │  ├─ Server operation
   │  ├─ Success: invalidate queries
   │  └─ Error: rollback
   └─ Auto-invalidate: staleTime expiry
```

---

## 📊 State Pattern Decision Matrix

| Scenario | Local | Context | Database | Cache |
|----------|-------|---------|----------|-------|
| UI toggle | ✅ | ❌ | ❌ | ❌ |
| Form input | ✅ | ❌ | ❌ | ❌ |
| Current user | ❌ | ✅ | ✅ | ❌ |
| App settings | ❌ | ✅ | ✅ | ❌ |
| Theme | ❌ | ✅ | ✅ | ❌ |
| User preferences | ❌ | ❌ | ✅ | ❌ |
| API response | ❌ | ❌ | ❌ | ✅ |
| Search results | ✅ | ❌ | ❌ | ✅ |
| Analytics data | ❌ | ❌ | ❌ | ✅ |
| List of items | ❌ | ❌ | ✅ | ✅ |
| Notification | ✅ | ✅ | ❌ | ❌ |

---

## ⚠️ Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Global Context for Everything
```typescript
// ❌ WRONG: Monolithic context with everything
const GlobalContext = createContext();
// Contains: user, theme, notifications, modals, forms, ...

// Result: Re-renders entire app on any change ❌
```

**Fix:** Split into separate concerns
```typescript
// ✅ RIGHT: Separate contexts
const AuthContext = createContext();      // User info
const ThemeContext = createContext();     // Theme settings
const NotificationsContext = createContext(); // Alerts
```

---

### ❌ Anti-Pattern 2: Database Reads Scattered
```typescript
// ❌ WRONG: Each component fetches directly
function ComponentA() {
  const [data, setData] = useState(null);
  useEffect(() => {
    Database.getData().then(setData);
  }, []);
}

function ComponentB() {
  const [data, setData] = useState(null);
  useEffect(() => {
    Database.getData().then(setData); // Same query, duplicate fetch!
  }, []);
}
```

**Fix:** Use custom hook or React Query
```typescript
// ✅ RIGHT: Centralized query
export function useData() {
  return useQuery({
    queryKey: ['data'],
    queryFn: () => Database.getData(),
  });
}

function ComponentA() {
  const { data } = useData(); // Uses cache
}

function ComponentB() {
  const { data } = useData(); // Same cached result
}
```

---

### ❌ Anti-Pattern 3: Forgetting tenantId
```typescript
// ❌ WRONG: No tenant isolation
const items = await Database.getItems();

// This might return items from OTHER tenants!
```

**Fix:** Always include tenantId
```typescript
// ✅ RIGHT: Tenant-aware query
const items = await Database.getItems({
  tenantId: currentUser.tenantId,
});
```

---

### ❌ Anti-Pattern 4: useState for Server State
```typescript
// ❌ WRONG: Duplicate server state locally
const [user, setUser] = useState(null);
useEffect(() => {
  Database.getUser(userId).then(setUser);
}, [userId]);

// Problem: Manual cache invalidation needed ❌
```

**Fix:** Use React Query
```typescript
// ✅ RIGHT: Let React Query manage cache
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => Database.getUser(userId),
});

// Automatic cache management ✅
```

---

## 🎯 Migration Checklist

### Step 1: Audit (1 week)
- [ ] List all useState instances
- [ ] List all useContext instances
- [ ] Map all Database reads
- [ ] Identify cache opportunities

### Step 2: Define (1 week)
- [ ] Choose context structure (max 3-4)
- [ ] Define database models
- [ ] Set up React Query
- [ ] Document patterns

### Step 3: Implement (2-3 weeks)
- [ ] Create standard hooks
- [ ] Migrate component state
- [ ] Migrate context usage
- [ ] Add React Query

### Step 4: Test (1 week)
- [ ] Unit tests for hooks
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing

### Step 5: Deploy (Ongoing)
- [ ] Gradual rollout
- [ ] Monitor performance
- [ ] Fix issues
- [ ] Document learnings

---

## 📚 Templates

### Custom Hook Template
```typescript
// src/hooks/use[Name].ts
import { useCallback, useEffect, useState } from 'react';

export interface [Name]State {
  // Define your state shape
  data: any;
  loading: boolean;
  error: Error | null;
}

export function use[Name](/* params */) {
  const [state, setState] = useState<[Name]State>({
    data: null,
    loading: false,
    error: null,
  });

  // Load data on mount
  useEffect(() => {
    // Load logic
  }, [/* dependencies */]);

  // Action handlers
  const action = useCallback(async (/* params */) => {
    // Action logic
  }, []);

  return { ...state, action };
}
```

### Context Provider Template
```typescript
// src/context/[Name]Context.tsx
import { createContext, useContext, useState } from 'react';

interface [Name]ContextType {
  // Define your context
}

const [Name]Context = createContext<[Name]ContextType | undefined>(undefined);

export function [Name]Provider({ children }) {
  const [state, setState] = useState({
    // Initial state
  });

  return (
    <[Name]Context.Provider value={{ state, setState }}>
      {children}
    </[Name]Context.Provider>
  );
}

export function use[Name]() {
  const context = useContext([Name]Context);
  if (!context) {
    throw new Error('use[Name] must be used within [Name]Provider');
  }
  return context;
}
```

---

## 🚀 Implementation Order

1. **Setup React Query** (4 hours)
   - Install packages
   - Create QueryClient
   - Set up provider
   - Add dev tools

2. **Create Context Structure** (6 hours)
   - AuthContext
   - ThemeContext
   - NotificationsContext
   - Custom hooks

3. **Migrate Database State** (20 hours)
   - Identify all database reads
   - Create hooks for each query
   - Replace scattered useState
   - Add React Query where applicable

4. **Consolidate Component State** (15 hours)
   - Audit all useState usage
   - Move global state to context
   - Move persistent state to database
   - Keep only UI state local

5. **Testing** (10 hours)
   - Unit tests for hooks
   - Integration tests
   - E2E tests

---

## ✅ Success Metrics

- [ ] Max 3-4 global context providers
- [ ] 80% reduction in useState instances in containers
- [ ] 100% of database reads use hooks
- [ ] 90%+ cache hit rate for repeated queries
- [ ] Zero duplicate database fetches
- [ ] All multi-tenant queries include tenantId
- [ ] <100ms time to interactive
- [ ] Zero console warnings/errors

---

**Generated:** December 25, 2025  
**Next Review:** After Phase 2 completion
