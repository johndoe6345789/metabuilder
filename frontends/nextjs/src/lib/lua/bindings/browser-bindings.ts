/**
 * Browser API Bindings for Lua Scripts
 *
 * Provides Lua scripts access to browser APIs like DOM info, page metadata,
 * and screenshot/capture functionality through a safe bridge.
 */

export interface BrowserBindings {
  page: {
    getTitle: () => string
    getUrl: () => string
    getViewport: () => { width: number; height: number }
    getUserAgent: () => string
    getTextContent: (maxLength?: number) => string
    getHtmlSample: (maxLength?: number) => string
  }
  dom: {
    querySelector: (selector: string) => { exists: boolean; text?: string; tagName?: string }
    querySelectorAll: (selector: string) => Array<{ text: string; tagName: string }>
    getElementCount: (selector: string) => number
  }
  storage: {
    getLocal: (key: string) => string | null
    setLocal: (key: string, value: string) => void
    getSession: (key: string) => string | null
    setSession: (key: string, value: string) => void
  }
  clipboard: {
    writeText: (text: string) => Promise<void>
    readText: () => Promise<string>
  }
}

/**
 * Creates browser bindings that can be injected into Lua execution context
 * Only available in browser environment
 */
export function createBrowserBindings(): BrowserBindings {
  const isBrowser = typeof window !== 'undefined'

  return {
    page: {
      getTitle: () => (isBrowser ? document.title : ''),
      getUrl: () => (isBrowser ? window.location.href : ''),
      getViewport: () =>
        isBrowser ? { width: window.innerWidth, height: window.innerHeight } : { width: 0, height: 0 },
      getUserAgent: () => (isBrowser ? navigator.userAgent : ''),
      getTextContent: (maxLength = 5000) =>
        isBrowser ? document.body.innerText.substring(0, maxLength) : '',
      getHtmlSample: (maxLength = 3000) =>
        isBrowser ? document.body.innerHTML.substring(0, maxLength) : '',
    },
    dom: {
      querySelector: (selector: string) => {
        if (!isBrowser) return { exists: false }
        try {
          const el = document.querySelector(selector)
          if (!el) return { exists: false }
          return {
            exists: true,
            text: el.textContent?.substring(0, 500) ?? '',
            tagName: el.tagName.toLowerCase(),
          }
        } catch {
          return { exists: false }
        }
      },
      querySelectorAll: (selector: string) => {
        if (!isBrowser) return []
        try {
          const elements = document.querySelectorAll(selector)
          return Array.from(elements)
            .slice(0, 100)
            .map(el => ({
              text: el.textContent?.substring(0, 200) ?? '',
              tagName: el.tagName.toLowerCase(),
            }))
        } catch {
          return []
        }
      },
      getElementCount: (selector: string) => {
        if (!isBrowser) return 0
        try {
          return document.querySelectorAll(selector).length
        } catch {
          return 0
        }
      },
    },
    storage: {
      getLocal: (key: string) => (isBrowser ? localStorage.getItem(key) : null),
      setLocal: (key: string, value: string) => {
        if (isBrowser) localStorage.setItem(key, value)
      },
      getSession: (key: string) => (isBrowser ? sessionStorage.getItem(key) : null),
      setSession: (key: string, value: string) => {
        if (isBrowser) sessionStorage.setItem(key, value)
      },
    },
    clipboard: {
      writeText: async (text: string) => {
        if (isBrowser) await navigator.clipboard.writeText(text)
      },
      readText: async () => {
        if (!isBrowser) return ''
        try {
          return await navigator.clipboard.readText()
        } catch {
          return ''
        }
      },
    },
  }
}

/**
 * Lua code template for browser operations
 * These functions are available in the Lua context when browser bindings are enabled
 */
export const BROWSER_LUA_BINDINGS = `
-- Page information bindings
function page_get_title()
  return __browser_page_get_title()
end

function page_get_url()
  return __browser_page_get_url()
end

function page_get_viewport()
  return __browser_page_get_viewport()
end

function page_get_user_agent()
  return __browser_page_get_user_agent()
end

function page_get_text_content(max_length)
  return __browser_page_get_text_content(max_length or 5000)
end

function page_get_html_sample(max_length)
  return __browser_page_get_html_sample(max_length or 3000)
end

-- DOM bindings
function dom_query_selector(selector)
  return __browser_dom_query_selector(selector)
end

function dom_query_selector_all(selector)
  return __browser_dom_query_selector_all(selector)
end

function dom_get_element_count(selector)
  return __browser_dom_get_element_count(selector)
end

-- Storage bindings
function storage_get_local(key)
  return __browser_storage_get_local(key)
end

function storage_set_local(key, value)
  return __browser_storage_set_local(key, value)
end

function storage_get_session(key)
  return __browser_storage_get_session(key)
end

function storage_set_session(key, value)
  return __browser_storage_set_session(key, value)
end

-- Clipboard bindings
function clipboard_write_text(text)
  return __browser_clipboard_write_text(text)
end

function clipboard_read_text()
  return __browser_clipboard_read_text()
end
`
