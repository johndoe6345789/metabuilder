import { getPlatform } from '@/config/aiPlatforms';
import { getStorageConfig } from '@/lib/storage';
import { getAuthToken } from '@/lib/authToken';

function baseUrl(): string {
  return (getStorageConfig().dbalUrl ?? '').replace(/\/$/, '');
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function analyzeErrorWithAI(
  errorMessage: string,
  errorStack?: string,
  context?: string
): Promise<string> {
  const platformId = (typeof window !== 'undefined' && localStorage.getItem('ai_platform')) || 'openai';
  const platform = getPlatform(platformId);

  // Backward compat: fall back to legacy openai_api_key for OpenAI platform
  const localApiKey = (typeof window !== 'undefined' &&
    (localStorage.getItem(`ai_key_${platformId}`) || (platformId === 'openai' ? localStorage.getItem('openai_api_key') : null))
  ) || '';

  if (platform.keyRequired && !localApiKey) {
    // Check if user has a key stored on server before failing
    const serverHasKey = await checkServerKey(platformId);
    if (!serverHasKey) {
      return buildFallback(errorMessage, context, 'Configure your AI platform API key in Settings to enable AI-powered error analysis.');
    }
  }

  try {
    const prompt = buildPrompt(errorMessage, context, errorStack);
    const flask = baseUrl();

    if (flask) {
      // Proxy through Flask backend — key is used server-side
      const r = await fetch(`${flask}/api/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          platformId: platform.id,
          apiFormat: platform.apiFormat,
          endpoint: platform.endpoint,
          model: platform.defaultModel,
          prompt,
          // Client-provided key as fallback if server has no stored key
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

    // No Flask backend — fall back to direct call (development / no-backend mode)
    if (platform.keyRequired && !localApiKey) {
      return buildFallback(errorMessage, context, 'Configure your AI platform API key in Settings to enable AI-powered error analysis.');
    }

    let responseText: string;
    if (platform.apiFormat === 'anthropic') {
      responseText = await callAnthropic(platform.endpoint, platform.defaultModel, localApiKey, prompt);
    } else {
      responseText = await callOpenAICompat(platform.endpoint, platform.defaultModel, localApiKey, prompt);
    }
    return responseText;
  } catch (err) {
    console.error('Error calling AI API:', err);
    return buildFallback(errorMessage, context, `Failed to get AI analysis. ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
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

function buildPrompt(errorMessage: string, context?: string, errorStack?: string): string {
  const contextInfo = context ? `\n\nContext: ${context}` : '';
  const stackInfo = errorStack ? `\n\nStack trace: ${errorStack}` : '';
  return `You are a helpful debugging assistant for a code snippet manager app. Analyze this error and provide:

1. A clear explanation of what went wrong (in plain language)
2. Why this error likely occurred
3. 2-3 specific actionable steps to fix it

Error message: ${errorMessage}${contextInfo}${stackInfo}

Keep your response concise, friendly, and focused on practical solutions. Format your response with clear sections using markdown.`;
}

async function callOpenAICompat(endpoint: string, model: string, apiKey: string, prompt: string): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful debugging assistant for a code snippet manager app.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) throw new Error('Failed to analyze error with AI. Please check your API key.');
  const data = await response.json();
  return data.choices[0]?.message?.content || 'Unable to analyze error.';
}

async function callAnthropic(endpoint: string, model: string, apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      system: 'You are a helpful debugging assistant for a code snippet manager app.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error('Failed to analyze error with AI. Please check your API key.');
  const data = await response.json();
  return data.content[0]?.text || 'Unable to analyze error.';
}

function buildFallback(errorMessage: string, context?: string, note?: string): string {
  const lines = ['## Error Analysis\n', '**Error Message:**', `\`${errorMessage}\`\n`];
  if (context) { lines.push('**Context:**'); lines.push(`${context}\n`); }
  if (note) lines.push(`**Note:** ${note}\n`);
  lines.push('**Basic Troubleshooting:**');
  lines.push('1. Check the browser console for more details');
  lines.push('2. Try refreshing the page');
  lines.push('3. Clear your browser cache and local storage');
  return lines.join('\n');
}
