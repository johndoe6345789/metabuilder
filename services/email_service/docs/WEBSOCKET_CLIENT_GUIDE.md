# WebSocket Client Integration Guide

**Purpose**: Guide for integrating WebSocket notifications in frontend applications
**Version**: 1.0.0
**Framework**: React/Next.js (adaptable to other frameworks)

## Installation

```bash
npm install socket.io-client
```

## Basic Setup

### React Hook for WebSocket Connection

```typescript
// hooks/useNotificationWebSocket.ts
import { useEffect, useRef, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'

interface WebSocketConfig {
  url: string
  userId: string
  accountId: string
  tenantId: string
  token?: string
}

export const useNotificationWebSocket = (config: WebSocketConfig) => {
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback(() => {
    socketRef.current = io(config.url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected')

      socketRef.current?.emit('authenticate', {
        userId: config.userId,
        accountId: config.accountId,
        tenantId: config.tenantId,
        token: config.token,
      })
    })

    socketRef.current.on('authenticated', (data) => {
      console.log('Authenticated:', data)
    })

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    socketRef.current.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }, [config])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
    socketRef.current = null
  }, [])

  const subscribe = useCallback((room: string) => {
    socketRef.current?.emit('subscribe', { room })
  }, [])

  const unsubscribe = useCallback((room: string) => {
    socketRef.current?.emit('unsubscribe', { room })
  }, [])

  const on = useCallback((event: string, callback: Function) => {
    socketRef.current?.on(event, callback)
  }, [])

  const off = useCallback((event: string, callback?: Function) => {
    if (callback) {
      socketRef.current?.off(event, callback as any)
    } else {
      socketRef.current?.off(event)
    }
  }, [])

  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data)
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    on,
    off,
    emit,
    isConnected: socketRef.current?.connected ?? false,
  }
}
```

### Usage in Component

```typescript
// components/NotificationCenter.tsx
import React, { useEffect, useState } from 'react'
import { useNotificationWebSocket } from '@/hooks/useNotificationWebSocket'
import { useAppDispatch, useAppSelector } from '@/store'
import { addNotification, markNotificationRead } from '@/store/notificationSlice'

export const NotificationCenter: React.FC = () => {
  const dispatch = useAppDispatch()
  const { userId, accountId, tenantId } = useAppSelector(state => state.auth)
  const notifications = useAppSelector(state => state.notifications.items)

  const { subscribe, unsubscribe, on, off } = useNotificationWebSocket({
    url: process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:5000',
    userId,
    accountId,
    tenantId,
    token: localStorage.getItem('authToken') || undefined,
  })

  useEffect(() => {
    // Subscribe to notification rooms
    subscribe(`user:${userId}:notifications`)
    subscribe(`user:${userId}:sync`)

    return () => {
      unsubscribe(`user:${userId}:notifications`)
      unsubscribe(`user:${userId}:sync`)
    }
  }, [userId, subscribe, unsubscribe])

  useEffect(() => {
    // Handle new message notification
    const handleNewMessage = (data: any) => {
      dispatch(addNotification({
        id: data.notificationId,
        type: 'new_message',
        title: data.sender,
        message: data.subject,
        data,
      }))
    }

    on('notification:new_message', handleNewMessage)

    return () => {
      off('notification:new_message', handleNewMessage)
    }
  }, [dispatch, on, off])

  useEffect(() => {
    // Handle sync complete
    const handleSyncComplete = (data: any) => {
      dispatch(addNotification({
        id: data.notificationId,
        type: 'sync_complete',
        title: 'Sync completed',
        message: `Synced ${data.folder}: ${data.messagesSynced} messages`,
        data,
      }))
    }

    on('notification:sync_complete', handleSyncComplete)

    return () => {
      off('notification:sync_complete', handleSyncComplete)
    }
  }, [dispatch, on, off])

  return (
    <div className="notification-center">
      {notifications.map(notif => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onDismiss={() => dispatch(markNotificationRead(notif.id))}
        />
      ))}
    </div>
  )
}
```

## Notification Toast Component

```typescript
// components/NotificationToast.tsx
import React, { useEffect, useState } from 'react'
import './NotificationToast.css'

interface NotificationToastProps {
  id: string
  type: 'new_message' | 'sync_complete' | 'sync_failed' | 'error'
  title: string
  message: string
  onDismiss: () => void
  autoClose?: boolean
  duration?: number
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  id,
  type,
  title,
  message,
  onDismiss,
  autoClose = true,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onDismiss])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case 'new_message':
        return '📧'
      case 'sync_complete':
        return '✅'
      case 'sync_failed':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className={`notification-toast notification-toast--${type}`}>
      <span className="notification-toast__icon">{getIcon()}</span>
      <div className="notification-toast__content">
        <h3 className="notification-toast__title">{title}</h3>
        <p className="notification-toast__message">{message}</p>
      </div>
      <button
        className="notification-toast__close"
        onClick={() => {
          setIsVisible(false)
          onDismiss()
        }}
      >
        ×
      </button>
    </div>
  )
}
```

## Redux Integration

```typescript
// store/slices/notificationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: number
  data?: any
}

interface NotificationState {
  items: Notification[]
  unreadCount: number
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload)
      if (!action.payload.isRead) {
        state.unreadCount++
      }
    },

    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notif = state.items.find(n => n.id === action.payload)
      if (notif && !notif.isRead) {
        notif.isRead = true
        state.unreadCount--
      }
    },

    markAllRead: (state) => {
      state.items.forEach(notif => {
        notif.isRead = true
      })
      state.unreadCount = 0
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const notif = state.items.find(n => n.id === action.payload)
      if (notif && !notif.isRead) {
        state.unreadCount--
      }
      state.items = state.items.filter(n => n.id !== action.payload)
    },

    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload
    },
  },
})

export const {
  addNotification,
  markNotificationRead,
  markAllRead,
  removeNotification,
  setUnreadCount,
} = notificationSlice.actions

export default notificationSlice.reducer
```

## API Integration

```typescript
// api/notificationClient.ts
import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api'

interface NotificationListParams {
  page?: number
  limit?: number
  unread_only?: boolean
  archived?: boolean
}

class NotificationClient {
  private getHeaders() {
    return {
      'X-Tenant-ID': localStorage.getItem('tenantId') || '',
      'X-User-ID': localStorage.getItem('userId') || '',
      'X-Account-ID': localStorage.getItem('accountId') || '',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
    }
  }

  async list(params?: NotificationListParams) {
    return axios.get(`${API_BASE}/notifications`, {
      params,
      headers: this.getHeaders(),
    })
  }

  async get(notificationId: string) {
    return axios.get(`${API_BASE}/notifications/${notificationId}`, {
      headers: this.getHeaders(),
    })
  }

  async markAsRead(notificationId: string) {
    return axios.post(`${API_BASE}/notifications/${notificationId}/read`, {}, {
      headers: this.getHeaders(),
    })
  }

  async markAsUnread(notificationId: string) {
    return axios.post(`${API_BASE}/notifications/${notificationId}/unread`, {}, {
      headers: this.getHeaders(),
    })
  }

  async archive(notificationId: string) {
    return axios.post(`${API_BASE}/notifications/${notificationId}/archive`, {}, {
      headers: this.getHeaders(),
    })
  }

  async bulkMarkRead(notificationIds: string[]) {
    return axios.post(`${API_BASE}/notifications/bulk-read`, {
      notificationIds,
    }, {
      headers: this.getHeaders(),
    })
  }

  async cleanupOld() {
    return axios.delete(`${API_BASE}/notifications/cleanup-old`, {
      headers: this.getHeaders(),
    })
  }

  async getPreferences() {
    return axios.get(`${API_BASE}/notifications/preferences`, {
      headers: this.getHeaders(),
    })
  }

  async updatePreferences(preferences: any) {
    return axios.put(`${API_BASE}/notifications/preferences`, preferences, {
      headers: this.getHeaders(),
    })
  }

  async addSilencedSender(email: string) {
    return axios.post(`${API_BASE}/notifications/preferences/silence`, {
      type: 'sender',
      value: email,
    }, {
      headers: this.getHeaders(),
    })
  }

  async removeSilencedSender(email: string) {
    return axios.post(`${API_BASE}/notifications/preferences/unsilence`, {
      type: 'sender',
      value: email,
    }, {
      headers: this.getHeaders(),
    })
  }

  async getDigests(page = 1, limit = 20) {
    return axios.get(`${API_BASE}/notifications/digests`, {
      params: { page, limit },
      headers: this.getHeaders(),
    })
  }

  async sendDigest(frequency: 'daily' | 'weekly' | 'monthly') {
    return axios.post(`${API_BASE}/notifications/digests/send`, {
      frequency,
    }, {
      headers: this.getHeaders(),
    })
  }

  async getStats() {
    return axios.get(`${API_BASE}/notifications/stats`, {
      headers: this.getHeaders(),
    })
  }
}

export const notificationClient = new NotificationClient()
```

## Notification Preferences UI

```typescript
// components/NotificationPreferences.tsx
import React, { useEffect, useState } from 'react'
import { notificationClient } from '@/api/notificationClient'
import { Button, Checkbox, Select, TextField } from '@metabuilder/fakemui'

export const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await notificationClient.getPreferences()
        setPreferences(response.data.data)
      } catch (error) {
        console.error('Failed to fetch preferences:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [])

  const handlePreferenceChange = (field: string, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      await notificationClient.updatePreferences(preferences)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="notification-preferences">
      <h2>Notification Settings</h2>

      <section>
        <h3>Notification Types</h3>
        <Checkbox
          checked={preferences.notifyNewMessage}
          onChange={(e) => handlePreferenceChange('notifyNewMessage', e.target.checked)}
          label="New messages"
        />
        <Checkbox
          checked={preferences.notifySyncComplete}
          onChange={(e) => handlePreferenceChange('notifySyncComplete', e.target.checked)}
          label="Sync complete"
        />
        <Checkbox
          checked={preferences.notifySyncFailed}
          onChange={(e) => handlePreferenceChange('notifySyncFailed', e.target.checked)}
          label="Sync failed"
        />
        <Checkbox
          checked={preferences.notifyError}
          onChange={(e) => handlePreferenceChange('notifyError', e.target.checked)}
          label="Errors"
        />
      </section>

      <section>
        <h3>Email Digest</h3>
        <Select
          value={preferences.digestFrequency}
          onChange={(e) => handlePreferenceChange('digestFrequency', e.target.value)}
          label="Frequency"
        >
          <option value="disabled">Disabled</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Select>

        {preferences.digestFrequency !== 'disabled' && (
          <>
            <TextField
              type="time"
              value={preferences.digestTime || '09:00'}
              onChange={(e) => handlePreferenceChange('digestTime', e.target.value)}
              label="Send time"
            />
            <TextField
              value={preferences.digestTimezone}
              onChange={(e) => handlePreferenceChange('digestTimezone', e.target.value)}
              label="Timezone"
            />
          </>
        )}
      </section>

      <section>
        <h3>Channels</h3>
        <Checkbox
          checked={preferences.channels?.includes('in_app')}
          onChange={(e) => {
            const channels = e.target.checked
              ? [...(preferences.channels || []), 'in_app']
              : (preferences.channels || []).filter((c: string) => c !== 'in_app')
            handlePreferenceChange('channels', channels)
          }}
          label="In-app notifications"
        />
        <Checkbox
          checked={preferences.channels?.includes('push')}
          onChange={(e) => {
            const channels = e.target.checked
              ? [...(preferences.channels || []), 'push']
              : (preferences.channels || []).filter((c: string) => c !== 'push')
            handlePreferenceChange('channels', channels)
          }}
          label="Push notifications"
        />
      </section>

      <section>
        <h3>Quiet Hours</h3>
        <Checkbox
          checked={preferences.quietHoursEnabled}
          onChange={(e) => handlePreferenceChange('quietHoursEnabled', e.target.checked)}
          label="Enable quiet hours"
        />

        {preferences.quietHoursEnabled && (
          <>
            <TextField
              type="time"
              value={preferences.quietHoursStart || '22:00'}
              onChange={(e) => handlePreferenceChange('quietHoursStart', e.target.value)}
              label="Quiet hours start"
            />
            <TextField
              type="time"
              value={preferences.quietHoursEnd || '08:00'}
              onChange={(e) => handlePreferenceChange('quietHoursEnd', e.target.value)}
              label="Quiet hours end"
            />
          </>
        )}
      </section>

      {saved && <div className="success-message">Settings saved</div>}
      <Button onClick={handleSave} variant="contained">
        Save Settings
      </Button>
    </div>
  )
}
```

## Browser Push Notifications

```typescript
// utils/pushNotifications.ts
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported')
    return
  }

  try {
    await navigator.serviceWorker.register('/sw.js')
    console.log('Service Worker registered')
  } catch (error) {
    console.error('Service Worker registration failed:', error)
  }
}

export async function requestPushPermission() {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported')
    return
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
    })

    // Send subscription to server
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    return false
  }
}

export async function unsubscribeFromPushNotifications() {
  if (!('serviceWorker' in navigator)) {
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
    }
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
  }
}
```

## Service Worker

```javascript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const { title, body, icon, badge, data: notificationData } = data

  const options = {
    body,
    icon: icon || '/images/icons/mail.png',
    badge: badge || '/images/badge.png',
    tag: 'notification',
    requireInteraction: false,
    data: notificationData,
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  // Handle notification click
  const { data } = event.notification
  if (data?.notificationId) {
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(`/notifications/${data.notificationId}`)
      }
    })
  }
})
```

## Performance Optimization

```typescript
// hooks/useNotificationCache.ts
import { useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

export const useNotificationCache = (ttl = 5 * 60 * 1000) => {
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map())

  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cacheRef.current.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > ttl) {
      cacheRef.current.delete(key)
      return null
    }

    return entry.data as T
  }, [ttl])

  const set = useCallback(<T,>(key: string, data: T) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
    })
  }, [])

  const clear = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  return { get, set, clear }
}
```

## Troubleshooting

### Connection Issues
```typescript
// Check WebSocket connection status
const { isConnected } = useNotificationWebSocket(config)

if (!isConnected) {
  console.warn('WebSocket not connected')
  // Implement retry logic or show warning to user
}
```

### Missing Notifications
```typescript
// Check subscription
const { subscribe } = useNotificationWebSocket(config)

useEffect(() => {
  subscribe(`user:${userId}:notifications`)

  return () => {
    // Don't unsubscribe if component unmounts temporarily
  }
}, [userId])
```

### Memory Leaks
```typescript
// Always cleanup event listeners
const { on, off } = useNotificationWebSocket(config)

useEffect(() => {
  const handler = (data: any) => {
    console.log(data)
  }

  on('notification:new_message', handler)

  return () => {
    off('notification:new_message', handler)  // Important!
  }
}, [on, off])
```
