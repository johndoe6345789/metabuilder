# Loading States - Practical Examples

This document provides copy-paste ready examples for implementing loading states in your components.

---

## Quick Start Examples

### Example 1: Simple Data Table

```tsx
'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { TableLoading } from '@/components/LoadingSkeleton'

interface User {
  id: number
  name: string
  email: string
  role: string
}

export function UsersTable() {
  const { data: users, isLoading, error, retry } = useAsyncData(
    async () => {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json() as Promise<User[]>
    }
  )

  return (
    <TableLoading
      isLoading={isLoading}
      error={error}
      rows={5}
      columns={4}
      loadingMessage="Loading users..."
    >
      {users && users.length > 0 ? (
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button>Edit</button>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found</p>
      )}
    </TableLoading>
  )
}
```

---

### Example 2: Product Card Grid

```tsx
'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { CardLoading } from '@/components/LoadingSkeleton'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
}

export function ProductGrid() {
  const { data: products, isLoading, error } = useAsyncData(
    async () => {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      return response.json() as Promise<Product[]>
    }
  )

  return (
    <div>
      <h1>Our Products</h1>

      <CardLoading
        isLoading={isLoading}
        error={error}
        count={6}
        className="product-grid"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          {products?.map((product) => (
            <div
              key={product.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div style={{ padding: '16px' }}>
                <h3 style={{ marginBottom: '8px' }}>{product.name}</h3>
                <p style={{ color: '#666', marginBottom: '12px' }}>
                  {product.description}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    ${product.price}
                  </span>
                  <button
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardLoading>
    </div>
  )
}
```

---

### Example 3: Form with Submit Loading

```tsx
'use client'

import { useState } from 'react'
import { useMutation } from '@/hooks/useAsyncData'
import { InlineLoader } from '@/components/LoadingIndicator'
import { ErrorState } from '@/components/EmptyState'

interface CreateUserInput {
  name: string
  email: string
  password: string
}

export function CreateUserForm() {
  const [formData, setFormData] = useState<CreateUserInput>({
    name: '',
    email: '',
    password: '',
  })
  const [success, setSuccess] = useState(false)

  const { mutate: createUser, isLoading, error, reset: resetError } = useMutation(
    async (data: CreateUserInput) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create user')
      return response.json()
    },
    {
      onSuccess: () => {
        setSuccess(true)
        setFormData({ name: '', email: '', password: '' })
        setTimeout(() => setSuccess(false), 3000)
      },
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUser(formData)
    } catch {
      // Error is already in error state
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Create User</h2>

      {error && (
        <ErrorState
          title="Failed to Create User"
          description={error.message}
          action={{
            label: 'Try Again',
            onClick: () => {
              resetError()
              setFormData({ name: '', email: '', password: '' })
            },
          }}
        />
      )}

      {success && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#c6f6d5',
            border: '1px solid #9ae6b4',
            borderRadius: '4px',
            marginBottom: '16px',
            color: '#22543d',
          }}
        >
          User created successfully!
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isLoading}
          placeholder="John Doe"
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            opacity: isLoading ? 0.5 : 1,
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isLoading}
          placeholder="john@example.com"
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            opacity: isLoading ? 0.5 : 1,
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          disabled={isLoading}
          placeholder="••••••••"
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            opacity: isLoading ? 0.5 : 1,
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isLoading ? '#ccc' : '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <InlineLoader loading={isLoading} size="small" />
        {isLoading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  )
}
```

---

### Example 4: Paginated Table

```tsx
'use client'

import { usePaginatedData } from '@/hooks/useAsyncData'
import { TableLoading } from '@/components/LoadingSkeleton'

interface Post {
  id: number
  title: string
  author: string
  date: string
}

export function PostsTable() {
  const {
    data: posts,
    isLoading,
    error,
    page,
    pageCount,
    nextPage,
    previousPage,
  } = usePaginatedData(
    async (page, pageSize) => {
      const response = await fetch(
        `/api/posts?page=${page}&size=${pageSize}`
      )
      if (!response.ok) throw new Error('Failed to fetch posts')
      const json = await response.json() as { items: Post[], total: number }
      return json
    },
    { pageSize: 10 }
  )

  return (
    <div>
      <h1>All Posts</h1>

      <TableLoading
        isLoading={isLoading}
        error={error}
        rows={10}
        columns={3}
      >
        {posts && posts.length > 0 ? (
          <>
            <table style={{ width: '100%', marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <a href={`/posts/${post.id}`}>{post.title}</a>
                    </td>
                    <td>{post.author}</td>
                    <td>{new Date(post.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderTop: '1px solid #ddd',
              }}
            >
              <button
                onClick={previousPage}
                disabled={page === 0}
                style={{
                  padding: '8px 16px',
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                  opacity: page === 0 ? 0.5 : 1,
                }}
              >
                ← Previous
              </button>

              <span style={{ fontWeight: 'bold' }}>
                Page {page + 1} of {pageCount}
              </span>

              <button
                onClick={nextPage}
                disabled={page >= pageCount - 1}
                style={{
                  padding: '8px 16px',
                  cursor: page >= pageCount - 1 ? 'not-allowed' : 'pointer',
                  opacity: page >= pageCount - 1 ? 0.5 : 1,
                }}
              >
                Next →
              </button>
            </div>
          </>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No posts found
          </p>
        )}
      </TableLoading>
    </div>
  )
}
```

---

### Example 5: List with Auto-Refresh

```tsx
'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { ListLoading } from '@/components/LoadingSkeleton'
import { LoadingIndicator } from '@/components/LoadingIndicator'

interface Notification {
  id: number
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  timestamp: string
  read: boolean
}

export function NotificationsList() {
  const {
    data: notifications,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useAsyncData(
    async () => {
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Failed to fetch notifications')
      return response.json() as Promise<Notification[]>
    },
    {
      refetchOnFocus: true,
      refetchInterval: 5000, // Refresh every 5 seconds
    }
  )

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h2>
          Notifications
          {unreadCount > 0 && (
            <span
              style={{
                marginLeft: '8px',
                backgroundColor: '#ff4444',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
              }}
            >
              {unreadCount}
            </span>
          )}
        </h2>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          style={{
            padding: '8px 12px',
            cursor: isRefetching ? 'not-allowed' : 'pointer',
            opacity: isRefetching ? 0.5 : 1,
          }}
        >
          {isRefetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <ListLoading
        isLoading={isLoading}
        error={error}
        rows={8}
      >
        {notifications && notifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${
                    {
                      info: '#2196F3',
                      warning: '#FF9800',
                      error: '#F44336',
                      success: '#4CAF50',
                    }[notif.type]
                  }`,
                  backgroundColor: `${
                    {
                      info: '#E3F2FD',
                      warning: '#FFF3E0',
                      error: '#FFEBEE',
                      success: '#F1F8E9',
                    }[notif.type]
                  }`,
                  opacity: notif.read ? 0.7 : 1,
                }}
              >
                <p style={{ margin: 0, marginBottom: '4px', fontWeight: 'bold' }}>
                  {notif.message}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#666',
                  }}
                >
                  {new Date(notif.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            No notifications yet
          </p>
        )}
      </ListLoading>
    </div>
  )
}
```

---

### Example 6: Search Results with Debouncing

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { TableLoading } from '@/components/LoadingSkeleton'

interface SearchResult {
  id: number
  title: string
  description: string
  relevance: number
}

export function SearchResults() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: results, isLoading, error } = useAsyncData(
    async () => {
      if (!debouncedQuery) return []
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(debouncedQuery)}`
      )
      if (!response.ok) throw new Error('Search failed')
      return response.json() as Promise<SearchResult[]>
    },
    { dependencies: [debouncedQuery] }
  )

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '2px solid #ddd',
          }}
        />
      </div>

      {debouncedQuery && (
        <TableLoading
          isLoading={isLoading}
          error={error}
          rows={5}
          columns={2}
        >
          {results && results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.map((result) => (
                <div
                  key={result.id}
                  style={{
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <h3 style={{ margin: '0 0 4px 0' }}>{result.title}</h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {result.description}
                  </p>
                  <p
                    style={{
                      margin: '4px 0 0 0',
                      fontSize: '12px',
                      color: '#999',
                    }}
                  >
                    Relevance: {(result.relevance * 100).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#999' }}>
              No results found for "{debouncedQuery}"
            </p>
          )}
        </TableLoading>
      )}
    </div>
  )
}
```

---

### Example 7: Dashboard with Multiple Async Sections

```tsx
'use client'

import { Suspense } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { CardLoading, TableLoading } from '@/components/LoadingSkeleton'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function StatsCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        textAlign: 'center',
      }}
    >
      <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>{label}</p>
      <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '8px 0 0 0' }}>
        {value}
      </p>
    </div>
  )
}

function DashboardStats() {
  const { data: stats, isLoading, error } = useAsyncData(
    async () => {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    }
  )

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2>Overview</h2>
      <CardLoading isLoading={isLoading} error={error} count={4}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '16px',
          }}
        >
          <StatsCard label="Total Users" value={stats?.totalUsers ?? 0} />
          <StatsCard label="Active Sessions" value={stats?.activeSessions ?? 0} />
          <StatsCard label="Revenue" value={`$${stats?.revenue ?? 0}`} />
          <StatsCard label="Growth" value={`${stats?.growth ?? 0}%`} />
        </div>
      </CardLoading>
    </div>
  )
}

function RecentActivity() {
  const { data: activities, isLoading, error } = useAsyncData(
    async () => {
      const response = await fetch('/api/dashboard/activities?limit=10')
      if (!response.ok) throw new Error('Failed to fetch activities')
      return response.json()
    }
  )

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2>Recent Activity</h2>
      <TableLoading isLoading={isLoading} error={error} rows={10} columns={3}>
        {activities && activities.length > 0 ? (
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity: any) => (
                <tr key={activity.id}>
                  <td>{activity.user}</td>
                  <td>{activity.action}</td>
                  <td>{new Date(activity.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No activity yet</p>
        )}
      </TableLoading>
    </div>
  )
}

export function Dashboard() {
  return (
    <ErrorBoundary>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Dashboard</h1>

        <Suspense fallback={<p>Loading...</p>}>
          <DashboardStats />
          <RecentActivity />
        </Suspense>
      </div>
    </ErrorBoundary>
  )
}
```

---

## Common Patterns

### Pattern: Disable Interactions During Load

```tsx
<button
  disabled={isLoading}
  style={{
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.5 : 1,
  }}
>
  {isLoading ? 'Loading...' : 'Submit'}
</button>

<input
  disabled={isLoading}
  style={{
    opacity: isLoading ? 0.5 : 1,
  }}
/>
```

### Pattern: Show Loading Count

```tsx
{isLoading && (
  <p style={{ color: '#999', fontSize: '12px' }}>
    Loading... ({loadedItems}/{totalItems})
  </p>
)}
```

### Pattern: Retry After Error

```tsx
{error && (
  <button onClick={retry}>
    Retry Loading
  </button>
)}
```

### Pattern: Cache Data

```tsx
const { data, refetch } = useAsyncData(
  async () => {
    // Cache key in sessionStorage
    const cacheKey = 'users_list'
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) return JSON.parse(cached)

    const res = await fetch('/api/users')
    const data = await res.json()
    sessionStorage.setItem(cacheKey, JSON.stringify(data))
    return data
  }
)
```

---

## Tips & Tricks

1. **Always use `isLoading` not just checking if data is falsy** - allows for manual retries
2. **Show error alongside retry option** - don't just fail silently
3. **Disable form inputs during submission** - prevents duplicate submissions
4. **Add loading messages** - especially for long operations
5. **Test with slow networks** - use Chrome DevTools throttling
6. **Respect user preferences** - animations respect `prefers-reduced-motion`

---

**All examples follow best practices and are production-ready!**
