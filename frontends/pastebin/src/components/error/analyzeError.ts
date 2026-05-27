import { getPlatform } from '@/config/aiPlatforms';
import { getStorageConfig } from '@/lib/storage';
import { getAuthToken } from '@/lib/authToken';
import {
  callOpenAICompat,
  callAnthropic,
  buildPrompt,
  buildFallback,
} from './analyzeError-api';

function baseUrl(): string {
  return (getStorageConfig().dbalUrl ?? '').replace(/\/$/, '');
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getLocalApiKey(platformId: string): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem(`ai_key_${platformId}`) ||
    (platformId === 'openai'
      ? localStorage.getItem('openai_api_key') ?? ''
      : '')
  );
}

const NO_KEY_MSG =
  'Configure your AI platform API key in Settings to ' +
  'enable AI-powered error analysis.';

async function callFlaskProxy(
  flask: string,
  platform: ReturnType<typeof getPlatform>,
  prompt: string,
  localApiKey: string
): Promise<string> {
  const r = await fetch(`${flask}/api/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      platformId: platform.id,
      apiFormat: platform.apiFormat,
      endpoint: platform.endpoint,
      model: platform.defaultModel,
      prompt,
      apiKey: localApiKey,
    }),
  });
  if (!r.ok) {
    const errBody = await r.json().catch(() => ({}));
    throw new Error(errBody.error ?? `HTTP ${r.status}`);
  }
  const data = await r.json();
  return data.result ?? 'Unable to analyze error.';
}

async function checkServerKey(platformId: string): Promise<boolean> {
  const flask = baseUrl();
  const token = getAuthToken();
  if (!flask || !token) return false;
  try {
    const r = await fetch(`${flask}/api/ai/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return false;
    const data = await r.json();
    return data.platformId === platformId && data.hasKey === true;
  } catch {
    return false;
  }
}

export async function analyzeErrorWithAI(
  errorMessage: string,
  errorStack?: string,
  context?: string
): Promise<string> {
  const platformId =
    (typeof window !== 'undefined' &&
      localStorage.getItem('ai_platform')) ||
    'openai';
  const platform = getPlatform(platformId);
  const localApiKey = getLocalApiKey(platformId);

  if (platform.keyRequired && !localApiKey) {
    const serverHasKey = await checkServerKey(platformId);
    if (!serverHasKey) {
      return buildFallback(errorMessage, context, NO_KEY_MSG);
    }
  }

  try {
    const prompt = buildPrompt(errorMessage, context, errorStack);
    const flask = baseUrl();

    if (flask) {
      return await callFlaskProxy(flask, platform, prompt, localApiKey);
    }

    if (platform.keyRequired && !localApiKey) {
      return buildFallback(errorMessage, context, NO_KEY_MSG);
    }

    return platform.apiFormat === 'anthropic'
      ? callAnthropic(
          platform.endpoint, platform.defaultModel,
          localApiKey, prompt
        )
      : callOpenAICompat(
          platform.endpoint, platform.defaultModel,
          localApiKey, prompt
        );
  } catch (err) {
    console.error('Error calling AI API:', err);
    return buildFallback(
      errorMessage, context,
      `Failed to get AI analysis. ${
        err instanceof Error ? err.message : 'Unknown error'
      }`
    );
  }
}
