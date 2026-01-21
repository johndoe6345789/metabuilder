/**
 * Spark Runtime - Core runtime services for Spark applications
 * 
 * This module provides implementations of Spark services including:
 * - KV storage (key-value store using IndexedDB)
 * - LLM service (language model integration)
 * - User authentication
 */

/// <reference path="../vite-end.d.ts" />

import { getStorage } from './storage-service'

export const sparkRuntime = {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]): string => {
    let result = strings[0]
    for (let i = 0; i < values.length; i++) {
      result += String(values[i]) + strings[i + 1]
    }
    return result
  },

  llm: async (prompt: string, modelName?: string, jsonMode?: boolean): Promise<string> => {
    console.log('Mock LLM called with prompt:', prompt, 'model:', modelName, 'jsonMode:', jsonMode)
    if (jsonMode) {
      return JSON.stringify({ 
        message: 'This is a mock response from the Spark LLM service.',
        model: modelName || 'gpt-4o'
      })
    }
    return 'This is a mock response from the Spark LLM service.'
  },

  user: async (): Promise<{
    avatarUrl: string
    email: string
    id: string
    isOwner: boolean
    login: string
  }> => {
    return {
      id: 'mock-user-id',
      login: 'mockuser',
      email: 'mock@example.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mockuser',
      isOwner: true
    }
  },
  
  kv: {
    get: async <T = any>(key: string): Promise<T | undefined> => {
      const storage = getStorage()
      return storage.get<T>(key)
    },
    set: async <T = any>(key: string, value: T): Promise<void> => {
      const storage = getStorage()
      return storage.set(key, value)
    },
    delete: async (key: string): Promise<void> => {
      const storage = getStorage()
      return storage.delete(key)
    },
    keys: async (): Promise<string[]> => {
      const storage = getStorage()
      return storage.keys()
    }
  }
}

if (typeof window !== 'undefined') {
  (window as any).spark = sparkRuntime;
  (globalThis as any).spark = sparkRuntime
}
