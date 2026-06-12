import {
  selectFilteredSnippets,
  selectSelectedSnippets,
  selectSelectedNamespace,
} from './selectors'
import type { RootState } from './index'
import type { Snippet, Namespace } from '@/lib/types'

function makeState(overrides: Partial<RootState> = {}): RootState {
  return {
    snippets: {
      items: [],
      loading: false,
      error: null,
      selectionMode: false,
      selectedIds: [],
    },
    namespaces: {
      items: [],
      selectedId: null,
      loading: false,
      error: null,
    },
    ui: {
      viewerOpen: false,
      viewingSnippet: null,
      searchQuery: '',
      theme: 'light',
      locale: 'en',
    },
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    },
    comments: {
      snippetComments: {},
      profileComments: {},
      loading: false,
      error: null,
    },
    revisions: {
      bySnippetId: {},
      loading: false,
      error: null,
    },
    share: {
      sharedSnippets: {},
      loading: false,
      error: null,
    },
    profiles: {
      byUsername: {},
      loading: false,
      error: null,
    },
    ...overrides,
  } as unknown as RootState
}

const snippet1: Snippet = {
  id: '1',
  title: 'Hello World',
  description: 'A classic',
  code: 'console.log("hello")',
  language: 'javascript',
  category: 'general',
  createdAt: 1000,
  updatedAt: 1000,
}

const snippet2: Snippet = {
  id: '2',
  title: 'Python script',
  description: 'Prints stuff',
  code: 'print("world")',
  language: 'python',
  category: 'general',
  createdAt: 2000,
  updatedAt: 2000,
}

const snippet3: Snippet = {
  id: '3',
  title: 'CSS reset',
  description: 'Resets styles',
  code: '* { margin: 0; }',
  language: 'css',
  category: 'css',
  createdAt: 3000,
  updatedAt: 3000,
}

describe('selectors', () => {
  describe('selectFilteredSnippets', () => {
    it('returns all snippets when query is empty', () => {
      const state = makeState({
        snippets: {
          items: [snippet1, snippet2],
          loading: false,
          error: null,
          selectionMode: false,
          selectedIds: [],
        },
        ui: {
          viewerOpen: false,
          viewingSnippet: null,
          searchQuery: '',
          theme: 'light',
          locale: 'en',
        },
      } as any)
      expect(selectFilteredSnippets(state)).toHaveLength(2)
    })

    it('returns all snippets when query is whitespace only', () => {
      const state = makeState({
        snippets: {
          items: [snippet1, snippet2],
          loading: false,
          error: null,
          selectionMode: false,
          selectedIds: [],
        },
        ui: {
          viewerOpen: false,
          viewingSnippet: null,
          searchQuery: '   ',
          theme: 'light',
          locale: 'en',
        },
      } as any)
      expect(selectFilteredSnippets(state)).toHaveLength(2)
    })

    it('filters by title (case-insensitive)', () => {
      const state = makeState({
        snippets: {
          items: [snippet1, snippet2, snippet3],
          loading: false,
          error: null,
          selectionMode: false,
          selectedIds: [],
        },
        ui: {
          viewerOpen: false,
          viewingSnippet: null,
          searchQuery: 'python',
          theme: 'light',
          locale: 'en',
        },
      } as any)
      const result = selectFilteredSnippets(state)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('filters by description', () => {
      const state = makeState({
        snippets: {
          items: [snippet1, snippet2, snippet3],
          loading: false,
          error: null,
          selectionMode: false,
          selectedIds: [],
        },
        ui: {
          viewerOpen: false,
          viewingSnippet: null,
          searchQuery: 'classic',
          theme: 'light',
          locale: 'en',
        },
      } as any)
      expect(selectFilteredSnippets(state)).toHaveLength(1)
      expect(selectFilteredSnippets(state)[0].id).toBe('1')
    })

    it('filters by language', () => {
      const state = makeState({
        snippets: {
          items: [snippet1, snippet2, snippet3],
          loading: false,
          error: null,
          selectionMode: false,
          selectedIds: [],
        },
        ui: {
          viewerOpen: false,
          viewingSnippet: null,
          searchQuery: 'css',
          theme: 'light',
          locale: 'en',
        },
      } as any)
      // eslint-disable-next-line max-len
      // snippet3 has language "css" and code contains "* { margin: 0; }" — both match
      const result = selectFilteredSnippets(state)
      expect(result.some(s => s.id === '3')).toBe(true)
    })

    it('filters by code content', () => {
      const state = makeState({
        snippets: {
          items: [snippet1, snippet2, snippet3],
          loading: false,
          error: null,
          selectionMode: false,
          selectedIds: [],
        },
        ui: {
          viewerOpen: false,
          viewingSnippet: null,
          searchQuery: 'margin',
          theme: 'light',
          locale: 'en',
        },
      } as any)
      expect(selectFilteredSnippets(state)).toHaveLength(1)
      expect(selectFilteredSnippets(state)[0].id).toBe('3')
    })

    it('returns empty array when no snippets match', () => {
      const state = makeState({
        snippets: {
          items: [snippet1, snippet2],
          loading: false,
          error: null,
          selectionMode: false,
          selectedIds: [],
        },
        ui: {
          viewerOpen: false,
          viewingSnippet: null,
          searchQuery: 'zzznomatch',
          theme: 'light',
          locale: 'en',
        },
      } as any)
      expect(selectFilteredSnippets(state)).toHaveLength(0)
    })

    it('is memoized — returns same reference for same inputs', () => {
      const state = makeState({
        snippets: {
          items: [snippet1],
          loading: false,
          error: null,
          selectionMode: false,
          selectedIds: [],
        },
        ui: {
          viewerOpen: false,
          viewingSnippet: null,
          searchQuery: '',
          theme: 'light',
          locale: 'en',
        },
      } as any)
      const result1 = selectFilteredSnippets(state)
      const result2 = selectFilteredSnippets(state)
      expect(result1).toBe(result2)
    })
  })

  describe('selectSelectedSnippets', () => {
    it('returns snippets matching selectedIds', () => {
      const state = makeState({
        snippets: {
          items: [snippet1, snippet2, snippet3],
          loading: false,
          error: null,
          selectionMode: false,
          selectedIds: ['1', '3'],
        },
      } as any)
      const result = selectSelectedSnippets(state)
      expect(result).toHaveLength(2)
      expect(result.map(s => s.id)).toEqual(expect.arrayContaining(['1', '3']))
    })

    it('returns empty array when no ids selected', () => {
      const state = makeState({
        snippets: {
          items: [snippet1, snippet2],
          loading: false,
          error: null,
          selectionMode: false,
          selectedIds: [],
        },
      } as any)
      expect(selectSelectedSnippets(state)).toHaveLength(0)
    })
  })

  describe('selectSelectedNamespace', () => {
    const ns1: Namespace = {
      id: 'ns1',
      name: 'Work',
      createdAt: 1000,
      isDefault: false,
    }
    const ns2: Namespace = {
      id: 'ns2',
      name: 'Personal',
      createdAt: 2000,
      isDefault: true,
    }

    it('returns the selected namespace', () => {
      const state = makeState({
        namespaces: {
          items: [ns1, ns2],
          selectedId: 'ns2',
          loading: false,
          error: null,
        },
      } as any)
      expect(selectSelectedNamespace(state)?.id).toBe('ns2')
    })

    it('returns undefined when selectedId is null', () => {
      const state = makeState({
        namespaces: {
          items: [ns1, ns2],
          selectedId: null,
          loading: false,
          error: null,
        },
      } as any)
      expect(selectSelectedNamespace(state)).toBeUndefined()
    })

    it('returns undefined when selectedId does not match any namespace', () => {
      const state = makeState({
        namespaces: {
          items: [ns1],
          selectedId: 'nonexistent',
          loading: false,
          error: null,
        },
      } as any)
      expect(selectSelectedNamespace(state)).toBeUndefined()
    })
  })
})
