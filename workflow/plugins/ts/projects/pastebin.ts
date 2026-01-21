/**
 * Pastebin Plugin - Code snippet sharing integration
 *
 * Enables workflow nodes to create, read, and manage code snippets
 * via the pastebin project's API.
 */

import * as path from 'path';

const PASTEBIN_PATH = path.resolve(__dirname, '../../../../pastebin');
const DEFAULT_API_URL = 'http://localhost:3001';

export interface PasteCreateInput {
  content: string;
  language?: string;
  title?: string;
  expiresIn?: '1h' | '1d' | '1w' | '1m' | 'never';
  apiUrl?: string;
}

export interface PasteCreateOutput {
  success: boolean;
  id?: string;
  url?: string;
  error?: string;
}

export interface PasteGetInput {
  id: string;
  apiUrl?: string;
}

export interface PasteGetOutput {
  success: boolean;
  content?: string;
  language?: string;
  title?: string;
  createdAt?: string;
  error?: string;
}

/**
 * Create a new paste/snippet
 */
export async function pasteCreate(input: PasteCreateInput): Promise<PasteCreateOutput> {
  const {
    content,
    language = 'plaintext',
    title,
    expiresIn = '1d',
    apiUrl = DEFAULT_API_URL,
  } = input;

  try {
    const response = await fetch(`${apiUrl}/api/pastes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, language, title, expiresIn }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      id: data.id,
      url: `${apiUrl}/p/${data.id}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get a paste by ID
 */
export async function pasteGet(input: PasteGetInput): Promise<PasteGetOutput> {
  const { id, apiUrl = DEFAULT_API_URL } = input;

  try {
    const response = await fetch(`${apiUrl}/api/pastes/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      content: data.content,
      language: data.language,
      title: data.title,
      createdAt: data.createdAt,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * List recent pastes
 */
export async function pasteList(input: {
  limit?: number;
  apiUrl?: string;
}): Promise<{ success: boolean; pastes?: Array<{ id: string; title?: string; language: string }>; error?: string }> {
  const { limit = 10, apiUrl = DEFAULT_API_URL } = input;

  try {
    const response = await fetch(`${apiUrl}/api/pastes?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      pastes: data.pastes,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Node definitions for workflow engine
export const pastebinNodes = {
  'pastebin.create': {
    description: 'Create a new code snippet',
    inputs: ['content', 'language', 'title', 'expiresIn', 'apiUrl'],
    outputs: ['success', 'id', 'url', 'error'],
    execute: pasteCreate,
  },
  'pastebin.get': {
    description: 'Get a paste by ID',
    inputs: ['id', 'apiUrl'],
    outputs: ['success', 'content', 'language', 'title', 'createdAt', 'error'],
    execute: pasteGet,
  },
  'pastebin.list': {
    description: 'List recent pastes',
    inputs: ['limit', 'apiUrl'],
    outputs: ['success', 'pastes', 'error'],
    execute: pasteList,
  },
};
