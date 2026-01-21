# Performance Optimization Guide

**Status**: Implementation Guide for Core Web Vitals
**Target**: All MetaBuilder developers

---

## One-Minute Summary

MetaBuilder must optimize:
1. **Largest Contentful Paint (LCP)**: < 2.5s
2. **First Input Delay (FID) / INP**: < 100ms
3. **Cumulative Layout Shift (CLS)**: < 0.1
4. **Time to Interactive (TTI)**: < 3.8s

---

## Current Performance Baseline

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Build Time | 2.4-2.6s | <5s | ✅ Excellent |
| Bundle Size | ~1.0 MB | <2 MB | ✅ Excellent |
| Static Content | ~1.0 MB | <2 MB | ✅ Excellent |
| TypeScript Errors | 0 | 0 | ✅ Pass |
| Type Checking | Pass | Pass | ✅ Pass |

---

## 1. Code Splitting

### Current Implementation
- ✅ Route-based splitting (automatic in Next.js)
- ✅ Dynamic imports for components
- ✅ Admin tools lazy-loaded

### Lazy-Loading Heavy Components

```typescript
// ✅ CORRECT: Lazy-load admin tools
import dynamic from 'next/dynamic'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'

const DatabaseManager = dynamic(
  () => import('@/components/admin/DatabaseManager'),
  {
    loading: () => <LoadingSkeleton variant="table" rows={10} />,
    ssr: true, // Server-side render for SEO
  }
)

const UserManager = dynamic(
  () => import('@/components/admin/UserManager'),
  {
    loading: () => <LoadingSkeleton variant="table" rows={10} />,
    ssr: true,
  }
)

const PackageManager = dynamic(
  () => import('@/components/admin/PackageManager'),
  {
    loading: () => <LoadingSkeleton variant="table" rows={10} />,
    ssr: true,
  }
)

// Usage in page
export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'packages' | 'database'>('users')

  return (
    <div>
      {activeTab === 'users' && <UserManager />}
      {activeTab === 'packages' && <PackageManager />}
      {activeTab === 'database' && <DatabaseManager />}
    </div>
  )
}
```

### Bundle Analysis

```bash
# Analyze bundle composition
npm run build -- --analyze

# Expected output:
# - React & React DOM: ~150KB
# - Next.js Runtime: ~100KB
# - Fakemui (Material UI): ~150KB
# - React Query: ~40KB
# - Application Code: ~300KB
# - Vendor Chunk: ~150KB
# - CSS/Assets: ~10KB
# Total: ~1.0 MB
```

### Tree-Shaking Verification

```typescript
// ✅ CORRECT: ES module imports (tree-shakeable)
import { Button, TextField } from '@/components/ui'
import { getDBALClient } from '@/dbal'
import { useQuery } from '@tanstack/react-query'

// ❌ WRONG: Wildcard imports (prevents tree-shaking)
import * as UI from '@/components/ui'
import * as DBAL from '@/dbal'

// ✅ CORRECT: No circular dependencies
// src/lib/utils.ts
export function formatDate(date: Date): string { /* ... */ }

// src/lib/components.ts
import { formatDate } from './utils'
export function DateDisplay() { /* ... */ }

// ❌ WRONG: Circular dependency
// src/lib/a.ts imports from './b'
// src/lib/b.ts imports from './a'
```

---

## 2. Image Optimization

### Next.js Image Component

```typescript
// ✅ CORRECT: Use Next.js Image
import Image from 'next/image'

export function UserCard({ imageUrl, name }: Props) {
  return (
    <article>
      <Image
        src={imageUrl}
        alt={`${name}'s profile picture`}
        width={300}
        height={300}
        loading="lazy"           // Lazy-load below-the-fold images
        quality={80}             // 80% JPEG quality = 20% file size reduction
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
        // Automatic features:
        // - Responsive sizing
        // - WebP + JPEG fallback
        // - Lazy loading
        // - Blur placeholder (optional)
      />
      <h3>{name}</h3>
    </article>
  )
}

// ✅ CORRECT: For above-the-fold images, use priority
<Image
  src={heroImageUrl}
  alt="Hero banner"
  width={1200}
  height={400}
  priority           // Load immediately, skip lazy-loading
  quality={85}
/>

// ✅ CORRECT: Fill layout for dynamic sizing
<div style={{ position: 'relative', width: '100%', height: 'auto', aspectRatio: '16/9' }}>
  <Image
    src={imageUrl}
    alt="Description"
    fill
    sizes="100vw"
    style={{ objectFit: 'cover' }}
  />
</div>
```

### Image Format Guidelines

| Format | Use Case | Quality | Size |
|--------|----------|---------|------|
| **WebP** | All modern browsers | 80% | Smallest (~30% smaller) |
| **JPEG** | Fallback, photos | 85% | Medium |
| **PNG** | Graphics, transparent | Lossless | Large |
| **SVG** | Icons, logos | Vector | Tiny |

**Quality Settings**:
```
- WebP: 75% quality (recommended)
- JPEG: 80-85% quality (recommended)
- PNG: 8-bit color (reduces size)
```

---

## 3. Font Optimization

### Current Implementation
✅ System fonts only (optimal performance)

### If Adding Web Fonts

```css
/* ✅ CORRECT: Optimized web font */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap; /* Show fallback, replace when ready */
  unicode-range: U+0020-007E; /* ASCII only */
}

@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
  unicode-range: U+0080-00FF; /* Latin extended */
}

/* ✅ CORRECT: Font stack */
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-feature-settings: 'kern' 1;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ✅ CORRECT: Preload critical fonts */
/* In layout.tsx: */
<link
  rel="preload"
  href="/fonts/inter-var.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

### Font Best Practices
- ✅ Use variable fonts (one file for all weights)
- ✅ Self-host fonts (avoid CDN delays)
- ✅ Use `font-display: swap` (prevent FOIT)
- ✅ Subset fonts (only needed characters)
- ✅ Limit to 2 weights (regular + bold)
- ✅ Preload only critical fonts
- ❌ Avoid @import from Google Fonts (extra request)

---

## 4. Core Web Vitals Optimization

### 4.1 Largest Contentful Paint (LCP) < 2.5s

**Goal**: Render page's main content in < 2.5 seconds

**Optimization Strategies**:

```typescript
// ✅ CORRECT: Preload critical resources
// In layout.tsx:
<link rel="preload" as="script" href="/js/app.js" />
<link rel="preload" as="style" href="/styles/critical.css" />

// ✅ CORRECT: Defer non-critical resources
<link rel="prefetch" href="/js/analytics.js" />
<link rel="prefetch" href="/css/admin.css" />

// ✅ CORRECT: Reduce Main Thread work
async function processLargeDataset(data: unknown[]) {
  const chunkSize = 100
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    await new Promise(resolve => setTimeout(resolve, 0))
    // Process chunk
  }
}

// ✅ CORRECT: Use Web Workers for heavy computation
const worker = new Worker('/workers/processor.ts')
worker.postMessage(largeDataset)
worker.onmessage = (event) => {
  // Handle results without blocking main thread
}

// ✅ CORRECT: Image optimization
<Image src={url} priority width={1200} height={400} />
```

**Measurement**:
```typescript
// Measure LCP in browser console
const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries()
  const lastEntry = entries[entries.length - 1]
  console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime)
})
observer.observe({ entryTypes: ['largest-contentful-paint'] })
```

### 4.2 First Input Delay (FID) / Interaction to Next Paint (INP) < 100ms

**Goal**: Respond to user input in < 100ms

**Optimization Strategies**:

```typescript
// ✅ CORRECT: Break up long tasks (>50ms)
function processUserInput(event: React.MouseEvent) {
  const data = event.currentTarget.dataset

  // Immediate feedback
  setProcessing(true)

  // Defer heavy processing
  setTimeout(async () => {
    const result = await heavyComputation(data)
    setResult(result)
    setProcessing(false)
  }, 0)
}

// ✅ CORRECT: Use useTransition for non-urgent updates
import { useTransition } from 'react'

export function FilteredList({ items }: Props) {
  const [filter, setFilter] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value)

    // Mark filter application as non-urgent
    startTransition(() => {
      // This update won't block user input
    })
  }

  return (
    <>
      <input
        value={filter}
        onChange={handleFilterChange}
        disabled={isPending}
      />
      {isPending && <Spinner />}
      <List items={filteredItems} />
    </>
  )
}

// ✅ CORRECT: Debounce expensive operations
import { useCallback } from 'react'

export function SearchForm() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  const handleSearch = useCallback(
    debounce(async (q: string) => {
      const data = await fetch(`/api/search?q=${q}`)
      setResults(await data.json())
    }, 300),
    []
  )

  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value)
        handleSearch(e.target.value)
      }}
    />
  )
}

// ✅ CORRECT: Use requestIdleCallback for non-critical work
function trackAnalytics() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Send analytics after page is interactive
    })
  } else {
    // Fallback for older browsers
    setTimeout(() => {
      // Send analytics
    }, 0)
  }
}
```

**Measurement**:
```typescript
// Measure INP in browser
const observer = new PerformanceObserver((list) => {
  const entries = list.getEntries()
  entries.forEach((entry) => {
    console.log('INP:', entry.duration)
  })
})
observer.observe({ entryTypes: ['event'] })
```

### 4.3 Cumulative Layout Shift (CLS) < 0.1

**Goal**: No unexpected layout changes (avoid jank)

**Optimization Strategies**:

```typescript
// ✅ CORRECT: Set size attributes for media
<Image
  src={url}
  width={300}
  height={200}
  alt="Description"
/>

// ✅ CORRECT: Use aspect-ratio for responsive images
<div style={{ aspectRatio: '16/9' }}>
  <Image src={url} fill alt="Description" />
</div>

// ✅ CORRECT: Reserve space for dynamic content
export function CommentList({ comments, isLoading }: Props) {
  return (
    <div>
      {/* Reserve space for loading skeleton */}
      <div style={{ minHeight: '200px' }}>
        {isLoading ? (
          <LoadingSkeleton variant="list" rows={3} />
        ) : (
          comments.map((c) => <Comment key={c.id} {...c} />)
        )}
      </div>
    </div>
  )
}

// ✅ CORRECT: Use transform instead of layout changes
const slideInAnimation = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`

styled.div`
  animation: ${slideInAnimation} 0.3s ease;
`

// ❌ WRONG: Position changes cause layout shift
.sidebar {
  transition: left 0.3s ease;
}
.sidebar.open {
  left: 0; /* Causes layout shift */
}

// ✅ CORRECT: Transform doesn't cause layout shift
.sidebar {
  transition: transform 0.3s ease;
  transform: translateX(-100%);
}
.sidebar.open {
  transform: translateX(0); /* No layout shift */
}

// ✅ CORRECT: Avoid inserting content above visible area
{/* Fixed position for new content */}
{showNotification && (
  <Notification style={{ position: 'fixed', bottom: 0 }} />
)}

// ✅ CORRECT: Set font-display to prevent FOUT
@font-face {
  font-family: 'CustomFont';
  src: url('/font.woff2') format('woff2');
  font-display: swap; /* Avoid layout shift when font loads */
}

// ✅ CORRECT: Disable scroll during animations
export function Modal({ isOpen, onClose }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'auto'
      }
    }
  }, [isOpen])

  return (
    <div role="dialog">{/* Modal content */}</div>
  )
}
```

**Measurement**:
```typescript
// Measure CLS in browser console
let clsValue = 0
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsValue += entry.value
      console.log('CLS:', clsValue)
    }
  }
})
observer.observe({ entryTypes: ['layout-shift'] })
```

---

## 5. Runtime Performance

### Memory Leaks Prevention

```typescript
// ✅ CORRECT: Clean up event listeners
export function Component() {
  useEffect(() => {
    const handleResize = () => {
      // Handle resize
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
}

// ✅ CORRECT: Clean up intervals/timeouts
export function Timer() {
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update timer
    }, 1000)
    return () => clearInterval(intervalId)
  }, [])
}

// ✅ CORRECT: Unsubscribe from observables
export function DataComponent() {
  useEffect(() => {
    const subscription = dataStream.subscribe((data) => {
      setData(data)
    })
    return () => subscription.unsubscribe()
  }, [])
}

// ❌ WRONG: Event listener not cleaned up (memory leak)
export function BadComponent() {
  useEffect(() => {
    window.addEventListener('resize', handleResize) // No cleanup
  }, [])
}
```

### React Performance Optimization

```typescript
// ✅ CORRECT: Memoize expensive computations
import { useMemo, useCallback } from 'react'

export function DataTable({ data, onSort }: Props) {
  const sortedData = useMemo(
    () => data.sort(/* expensive sort */),
    [data]
  )

  const handleSort = useCallback(
    (column: string) => {
      onSort(column)
    },
    [onSort]
  )

  return <Table data={sortedData} onSort={handleSort} />
}

// ✅ CORRECT: Memoize components to prevent re-renders
import { memo } from 'react'

const UserCard = memo(({ user }: Props) => {
  return <Card>{user.name}</Card>
}, (prev, next) => prev.user.id === next.user.id)

// ✅ CORRECT: Lazy load components
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/Chart'), {
  loading: () => <Skeleton />,
})

// ✅ CORRECT: Use React.Suspense for data loading
import { Suspense } from 'react'

export function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ExpensiveComponent />
    </Suspense>
  )
}
```

---

## 6. Network Performance

### Request Optimization

```typescript
// ✅ CORRECT: Request batching
async function fetchMultipleUsers(ids: string[]) {
  // Batch requests instead of making individual calls
  const response = await fetch(`/api/users?ids=${ids.join(',')}`)
  return response.json()
}

// ✅ CORRECT: Request deduplication
const cache = new Map<string, Promise<unknown>>()

export function useFetchData(key: string) {
  if (cache.has(key)) {
    return cache.get(key)
  }

  const promise = fetch(`/api/data/${key}`).then(r => r.json())
  cache.set(key, promise)
  return promise
}

// ✅ CORRECT: Use React Query for request deduplication
import { useQuery } from '@tanstack/react-query'

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetch(`/api/users/${id}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

// ✅ CORRECT: Prefetch data
const queryClient = useQueryClient()

export function UserLink({ id }: Props) {
  return (
    <a
      href={`/users/${id}`}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: ['user', id],
          queryFn: () => fetch(`/api/users/${id}`).then(r => r.json()),
        })
      }}
    >
      View Profile
    </a>
  )
}
```

### Caching Strategy

```typescript
// ✅ CORRECT: Set cache headers
// In Next.js route handler:
export async function GET(request: Request) {
  const data = await fetchData()

  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Content-Type': 'application/json',
    },
  })
}

// Cache control directives:
// - public: Cacheable by any cache
// - private: Only cacheable by browser
// - max-age=3600: Cache for 1 hour in browser
// - s-maxage=86400: Cache for 1 day in CDN
// - must-revalidate: Revalidate after expiry
// - no-cache: Revalidate before using
// - no-store: Don't cache
```

---

## 7. Performance Monitoring

### Web Vitals Integration

```typescript
// pages/_app.tsx
import { useEffect } from 'react'
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Send to analytics service
    const handleMetric = (metric: Metric) => {
      // Send to tracking service
      if (typeof window !== 'undefined') {
        navigator.sendBeacon('/api/metrics', JSON.stringify(metric))
      }
    }

    getCLS(handleMetric)
    getFID(handleMetric)
    getFCP(handleMetric)
    getLCP(handleMetric)
    getTTFB(handleMetric)
  }, [])

  return <Component {...pageProps} />
}
```

### Performance DevTools

```bash
# Lighthouse CLI
npm install -g @lhci/cli
lhci autorun

# Bundle analyzer
npm install --save-dev @next/bundle-analyzer
# See next.config.js for usage

# Performance monitoring
npm install web-vitals @tanstack/react-query
```

---

## 8. Checklist: Performance Implementation

### Code Splitting
- [ ] Route-based splitting enabled
- [ ] Admin tools lazy-loaded
- [ ] Heavy components lazy-loaded with dynamic()
- [ ] No unnecessary bundled code

### Image Optimization
- [ ] Using Next.js Image component
- [ ] Lazy loading for below-the-fold
- [ ] Priority attribute for above-the-fold
- [ ] Responsive sizing with srcSet

### Font Optimization
- [ ] Using system fonts (or optimized web fonts)
- [ ] font-display: swap configured
- [ ] Fonts self-hosted (not CDN)
- [ ] Preloaded only critical fonts

### Core Web Vitals
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] No layout shifts

### Runtime Performance
- [ ] No memory leaks
- [ ] Event listeners cleaned up
- [ ] Intervals/timeouts cleaned up
- [ ] Components memoized where needed

### Network Performance
- [ ] Requests batched
- [ ] Responses cached
- [ ] Prefetching implemented
- [ ] Request deduplication enabled

### Monitoring
- [ ] Web Vitals tracked
- [ ] Lighthouse baseline established
- [ ] Performance budgets set
- [ ] Analytics integration ready

---

## Resources

**Tools**:
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- Web Vitals: https://web.dev/vitals/
- Bundle Analyzer: https://www.npmjs.com/package/@next/bundle-analyzer
- Chrome DevTools: Built-in

**Learning**:
- Web.dev performance: https://web.dev/performance/
- MDN Web Performance: https://developer.mozilla.org/en-US/docs/Web/Performance
- Next.js optimization: https://nextjs.org/learn/seo/web-performance

**Status**: ✅ Ready for implementation
