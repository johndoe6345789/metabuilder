export interface AIPlatform {
  id: string;
  name: string;
  endpoint: string;
  defaultModel: string;
  keyPlaceholder: string;
  keyRequired: boolean;
  docsUrl: string;
  docsLabel: string;
  /** For platforms with non-OpenAI API format */
  apiFormat: 'openai' | 'anthropic';
}

export const AI_PLATFORMS: AIPlatform[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    keyPlaceholder: 'sk-...',
    keyRequired: true,
    docsUrl: 'https://platform.openai.com/api-keys',
    docsLabel: 'OpenAI Platform',
    apiFormat: 'openai',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-haiku-4-5-20251001',
    keyPlaceholder: 'sk-ant-...',
    keyRequired: true,
    docsUrl: 'https://console.anthropic.com/settings/keys',
    docsLabel: 'Anthropic Console',
    apiFormat: 'anthropic',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    defaultModel: 'gemini-1.5-flash',
    keyPlaceholder: 'AIza...',
    keyRequired: true,
    docsUrl: 'https://aistudio.google.com/app/apikey',
    docsLabel: 'Google AI Studio',
    apiFormat: 'openai',
  },
  {
    id: 'groq',
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.1-8b-instant',
    keyPlaceholder: 'gsk_...',
    keyRequired: true,
    docsUrl: 'https://console.groq.com/keys',
    docsLabel: 'Groq Console',
    apiFormat: 'openai',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    keyPlaceholder: 'sk-or-...',
    keyRequired: true,
    docsUrl: 'https://openrouter.ai/keys',
    docsLabel: 'OpenRouter',
    apiFormat: 'openai',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    endpoint: 'http://localhost:11434/v1/chat/completions',
    defaultModel: 'llama3.2',
    keyPlaceholder: 'No key required',
    keyRequired: false,
    docsUrl: 'https://ollama.ai',
    docsLabel: 'Ollama',
    apiFormat: 'openai',
  },
];

export const DEFAULT_PLATFORM_ID = 'openai';

export function getPlatform(id: string): AIPlatform {
  return AI_PLATFORMS.find(p => p.id === id) ?? AI_PLATFORMS[0];
}
