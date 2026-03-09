/**
 * LLM Service - Claude API integration for CodeForge
 *
 * Calls the /api/ai route which proxies to Anthropic Claude API.
 * Controlled by NEXT_PUBLIC_AI_ENABLED env var (default: true).
 */

import { BASE_PATH } from '@/config/app-config'

const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED !== 'false'

export function llmPrompt(strings: TemplateStringsArray, ...values: unknown[]): string {
  let result = strings[0]
  for (let i = 0; i < values.length; i++) {
    result += String(values[i]) + strings[i + 1]
  }
  return result
}

export async function llm(prompt: string, modelName?: string, jsonMode?: boolean): Promise<string> {
  if (!AI_ENABLED) {
    throw new Error('AI features are disabled. Set NEXT_PUBLIC_AI_ENABLED=true to enable.')
  }

  const response = await fetch(`${BASE_PATH}/api/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model: modelName, jsonMode }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
    throw new Error(error.error || `AI request failed: ${response.status}`)
  }

  const data = await response.json()
  return data.text
}

export function isAIEnabled(): boolean {
  return AI_ENABLED
}
