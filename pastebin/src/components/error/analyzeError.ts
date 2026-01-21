export async function analyzeErrorWithAI(
  errorMessage: string,
  errorStack?: string,
  context?: string
): Promise<string> {
  // Check if OpenAI API key is configured
  const apiKey = localStorage.getItem('openai_api_key');
  
  if (!apiKey) {
    // Fallback to simple error analysis if no API key
    const lines = ['## Error Analysis\n'];
    
    lines.push('**Error Message:**');
    lines.push(`\`${errorMessage}\`\n`);
    
    if (context) {
      lines.push('**Context:**');
      lines.push(`${context}\n`);
    }
    
    lines.push('**Note:** Configure your OpenAI API key in Settings to enable AI-powered error analysis.\n');
    
    lines.push('**Basic Troubleshooting:**');
    lines.push('1. Check the browser console for more details');
    lines.push('2. Try refreshing the page');
    lines.push('3. Clear your browser cache and local storage');
    
    return lines.join('\n');
  }

  // Use OpenAI API for advanced error analysis
  try {
    const contextInfo = context ? `\n\nContext: ${context}` : '';
    const stackInfo = errorStack ? `\n\nStack trace: ${errorStack}` : '';
    
    const prompt = `You are a helpful debugging assistant for a code snippet manager app. Analyze this error and provide:

1. A clear explanation of what went wrong (in plain language)
2. Why this error likely occurred
3. 2-3 specific actionable steps to fix it

Error message: ${errorMessage}${contextInfo}${stackInfo}

Keep your response concise, friendly, and focused on practical solutions. Format your response with clear sections using markdown.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful debugging assistant for a code snippet manager app.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze error with AI. Please check your API key.');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to analyze error.';
  } catch (err) {
    console.error('Error calling OpenAI API:', err);
    
    // Fallback to simple analysis if API call fails
    return `## Error Analysis

**Error Message:**
\`${errorMessage}\`

**Note:** Failed to get AI analysis. ${err instanceof Error ? err.message : 'Unknown error'}

**Basic Troubleshooting:**
1. Check the browser console for more details
2. Try refreshing the page
3. Verify your OpenAI API key in Settings`;
  }
}
