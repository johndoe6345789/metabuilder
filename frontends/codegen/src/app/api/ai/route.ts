import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 503 }
    )
  }

  const aiEnabled = process.env.NEXT_PUBLIC_AI_ENABLED !== 'false'
  if (!aiEnabled) {
    return NextResponse.json(
      { error: 'AI features are disabled' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { prompt, model, jsonMode } = body as {
      prompt: string
      model?: string
      jsonMode?: boolean
    }

    if (!prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const claudeModel = resolveModel(model)

    const messages = [{ role: 'user' as const, content: prompt }]

    const anthropicBody: Record<string, unknown> = {
      model: claudeModel,
      max_tokens: 4096,
      messages,
    }

    if (jsonMode) {
      anthropicBody.system = 'You must respond with valid JSON only. No markdown, no explanations outside the JSON.'
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', response.status, errorText)
      return NextResponse.json(
        { error: `Claude API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const textContent = data.content?.find(
      (block: { type: string }) => block.type === 'text'
    )
    const text = textContent?.text ?? ''

    return NextResponse.json({ text, model: claudeModel })
  } catch (error) {
    console.error('AI route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function resolveModel(requested?: string): string {
  const modelMap: Record<string, string> = {
    'gpt-4o': 'claude-sonnet-4-5-20250929',
    'gpt-4o-mini': 'claude-haiku-4-5-20251001',
    'claude-sonnet': 'claude-sonnet-4-5-20250929',
    'claude-haiku': 'claude-haiku-4-5-20251001',
    'claude-opus': 'claude-opus-4-6',
  }

  if (requested && modelMap[requested]) {
    return modelMap[requested]
  }

  if (requested?.startsWith('claude-')) {
    return requested
  }

  return 'claude-sonnet-4-5-20250929'
}
