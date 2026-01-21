const CACHE_VERSION = 'codeforge-v1.0.0'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const IMAGE_CACHE = `${CACHE_VERSION}-images`

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/main.css',
  '/src/index.css',
  '/src/App.tsx',
  '/manifest.json',
]

const MAX_DYNAMIC_CACHE_SIZE = 50
const MAX_IMAGE_CACHE_SIZE = 30

const limitCacheSize = (cacheName, maxItems) => {
  caches.open(cacheName).then(cache => {
    if (!cache) return
    cache.keys().then(keys => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxItems))
      }
    }).catch(err => console.error('[Service Worker] Cache keys error:', err))
  }).catch(err => console.error('[Service Worker] Cache open error:', err))
}

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        if (!cache || !cache.addAll) {
          console.error('[Service Worker] Cache API not available')
          return Promise.resolve()
        }
        console.log('[Service Worker] Caching static assets')
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.error('[Service Worker] Failed to cache some assets:', err)
          return Promise.resolve()
        })
      })
      .catch(err => {
        console.error('[Service Worker] Cache open failed:', err)
        return Promise.resolve()
      })
  )
  
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return cacheName.startsWith('codeforge-') && 
                   cacheName !== STATIC_CACHE && 
                   cacheName !== DYNAMIC_CACHE &&
                   cacheName !== IMAGE_CACHE
          })
          .map(cacheName => {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )
  
  return self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') {
    return
  }

  if (url.origin.includes('googleapis') || url.origin.includes('gstatic')) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchRes => {
          return caches.open(STATIC_CACHE).then(cache => {
            if (cache && cache.put) {
              cache.put(request, fetchRes.clone()).catch(err => 
                console.error('[Service Worker] Cache put error:', err)
              )
            }
            return fetchRes
          }).catch(() => fetchRes)
        }).catch(() => response)
      })
    )
    return
  }

  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchRes => {
          return caches.open(IMAGE_CACHE).then(cache => {
            if (cache && cache.put) {
              cache.put(request, fetchRes.clone()).catch(err => 
                console.error('[Service Worker] Image cache put error:', err)
              )
              limitCacheSize(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE)
            }
            return fetchRes
          }).catch(() => fetchRes)
        }).catch(() => {
          return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#ccc" width="100" height="100"/></svg>', {
            headers: { 'Content-Type': 'image/svg+xml' }
          })
        })
      })
    )
    return
  }

  if (url.pathname.startsWith('/src/') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchRes => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            if (cache && cache.put) {
              cache.put(request, fetchRes.clone()).catch(err => 
                console.error('[Service Worker] Dynamic cache put error:', err)
              )
              limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE)
            }
            return fetchRes
          }).catch(() => fetchRes)
        }).catch(() => {
          if (request.destination === 'document') {
            return caches.match('/index.html')
          }
        })
      })
    )
    return
  }

  event.respondWith(
    caches.match(request)
      .then(response => {
        return response || fetch(request).then(fetchRes => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            if (cache && cache.put) {
              cache.put(request, fetchRes.clone()).catch(err => 
                console.error('[Service Worker] Cache put error:', err)
              )
              limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE)
            }
            return fetchRes
          }).catch(() => fetchRes)
        })
      })
      .catch(() => {
        if (request.destination === 'document') {
          return caches.match('/index.html')
        }
      })
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
      }).then(() => {
        return self.clients.matchAll()
      }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'CACHE_CLEARED' })
        })
      })
    )
  }
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-projects') {
    event.waitUntil(syncProjects())
  }
})

async function syncProjects() {
  console.log('[Service Worker] Syncing projects...')
}

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'CodeForge'
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || []
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})
