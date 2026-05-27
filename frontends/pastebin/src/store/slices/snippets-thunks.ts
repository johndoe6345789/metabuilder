/**
 * Async thunks for snippetsSlice
 */

import { createAsyncThunk } from '@reduxjs/toolkit'
import { Snippet } from '@/lib/types'
import {
  getAllSnippets,
  createSnippet as createSnippetDB,
  updateSnippet as updateSnippetDB,
  deleteSnippet as deleteSnippetDB,
  getSnippetsByNamespace,
  bulkMoveSnippets as bulkMoveSnippetsDB,
  moveSnippetToNamespace,
} from '@/lib/db'

export const fetchAllSnippets = createAsyncThunk(
  'snippets/fetchAll',
  async () => getAllSnippets()
)

export const fetchSnippetsByNamespace = createAsyncThunk(
  'snippets/fetchByNamespace',
  async (namespaceId: string) => getSnippetsByNamespace(namespaceId)
)

export const createSnippet = createAsyncThunk(
  'snippets/create',
  async (snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSnippet: Snippet = {
      ...snippetData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    return createSnippetDB(newSnippet)
  }
)

export const updateSnippet = createAsyncThunk(
  'snippets/update',
  async (snippet: Snippet) => {
    const updatedSnippet = { ...snippet, updatedAt: Date.now() }
    await updateSnippetDB(updatedSnippet)
    return updatedSnippet
  }
)

export const deleteSnippet = createAsyncThunk(
  'snippets/delete',
  async (id: string) => {
    await deleteSnippetDB(id)
    return id
  }
)

export const moveSnippet = createAsyncThunk(
  'snippets/move',
  async ({
    snippetId,
    targetNamespaceId,
  }: {
    snippetId: string
    targetNamespaceId: string
  }) => {
    await moveSnippetToNamespace(snippetId, targetNamespaceId)
    return { snippetId, targetNamespaceId }
  }
)

export const bulkMoveSnippets = createAsyncThunk(
  'snippets/bulkMove',
  async ({
    snippetIds,
    targetNamespaceId,
  }: {
    snippetIds: string[]
    targetNamespaceId: string
  }) => {
    await bulkMoveSnippetsDB(snippetIds, targetNamespaceId)
    return { snippetIds, targetNamespaceId }
  }
)
