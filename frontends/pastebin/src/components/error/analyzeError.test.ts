import { analyzeErrorWithAI } from './analyzeError'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock fetch
global.fetch = jest.fn()

describe('analyzeErrorWithAI Function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Without API Key', () => {
    it('returns fallback analysis when no API key configured', async () => {
      const result = await analyzeErrorWithAI('Test error')

      expect(result).toContain('## Error Analysis')
      expect(result).toContain('Test error')
      expect(result).toContain('Configure your OpenAI API key')
    })

    it('includes error message in fallback', async () => {
      const errorMessage = 'Custom error message'
      const result = await analyzeErrorWithAI(errorMessage)

      expect(result).toContain(errorMessage)
    })

    it('includes context in fallback when provided', async () => {
      const context = 'User was editing snippet'
      const result = await analyzeErrorWithAI('Error', undefined, context)

      expect(result).toContain(context)
    })

    it('includes basic troubleshooting steps in fallback', async () => {
      const result = await analyzeErrorWithAI('Test error')

      expect(result).toContain('Check the browser console')
      expect(result).toContain('Try refreshing the page')
      expect(result).toContain('Clear your browser cache')
    })

    it('returns markdown formatted response', async () => {
      const result = await analyzeErrorWithAI('Error')

      expect(result).toContain('##')
      expect(result).toContain('**')
    })

    it('includes note about API key configuration', async () => {
      const result = await analyzeErrorWithAI('Error')

      expect(result).toContain('OpenAI API key')
      expect(result).toContain('Settings')
    })
  })

  describe('With API Key', () => {
    beforeEach(() => {
      localStorage.setItem('openai_api_key', 'test-api-key-12345')
    })

    it('calls OpenAI API when API key is configured', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'AI Analysis Result',
              },
            },
          ],
        }),
      } as Response)

      const result = await analyzeErrorWithAI('Test error')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.any(Object)
      )
      expect(result).toContain('AI Analysis Result')
    })

    it('includes bearer token in authorization header', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      } as Response)

      await analyzeErrorWithAI('Error')

      const callArgs = mockFetch.mock.calls[0]
      const headers = (callArgs[1] as RequestInit).headers as Record<string, string>
      expect(headers['Authorization']).toBe('Bearer test-api-key-12345')
    })

    it('sends correct content-type header', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      } as Response)

      await analyzeErrorWithAI('Error')

      const callArgs = mockFetch.mock.calls[0]
      const headers = (callArgs[1] as RequestInit).headers as Record<string, string>
      expect(headers['Content-Type']).toBe('application/json')
    })

    it('uses gpt-4o-mini model', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      } as Response)

      await analyzeErrorWithAI('Error')

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse((callArgs[1] as RequestInit).body as string)
      expect(body.model).toBe('gpt-4o-mini')
    })

    it('includes system prompt in request', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      } as Response)

      await analyzeErrorWithAI('Error')

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse((callArgs[1] as RequestInit).body as string)
      expect(body.messages[0].role).toBe('system')
      expect(body.messages[0].content).toContain('debugging assistant')
    })

    it('includes error message in user prompt', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      } as Response)

      const errorMsg = 'TypeError: Cannot read property'
      await analyzeErrorWithAI(errorMsg)

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse((callArgs[1] as RequestInit).body as string)
      expect(body.messages[1].content).toContain(errorMsg)
    })

    it('includes stack trace in prompt when provided', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      } as Response)

      const stack = 'at Object.<anonymous>'
      await analyzeErrorWithAI('Error', stack)

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse((callArgs[1] as RequestInit).body as string)
      expect(body.messages[1].content).toContain('Stack trace')
      expect(body.messages[1].content).toContain(stack)
    })

    it('includes context in prompt when provided', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      } as Response)

      const context = 'Saving snippet'
      await analyzeErrorWithAI('Error', undefined, context)

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse((callArgs[1] as RequestInit).body as string)
      expect(body.messages[1].content).toContain('Context')
      expect(body.messages[1].content).toContain(context)
    })

    it('sets temperature to 0.7', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      } as Response)

      await analyzeErrorWithAI('Error')

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse((callArgs[1] as RequestInit).body as string)
      expect(body.temperature).toBe(0.7)
    })

    it('sets max_tokens to 500', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      } as Response)

      await analyzeErrorWithAI('Error')

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse((callArgs[1] as RequestInit).body as string)
      expect(body.max_tokens).toBe(500)
    })

    it('returns AI response content', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      const aiContent = '## Error Analysis\n\nDetailed analysis here'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: aiContent,
              },
            },
          ],
        }),
      } as Response)

      const result = await analyzeErrorWithAI('Error')

      expect(result).toBe(aiContent)
    })
  })

  describe('API Errors', () => {
    beforeEach(() => {
      localStorage.setItem('openai_api_key', 'test-api-key')
    })

    it('returns fallback on API error response', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      } as Response)

      const result = await analyzeErrorWithAI('Error')

      expect(result).toContain('## Error Analysis')
      expect(result).toContain('Failed to get AI analysis')
    })

    it('includes error message in fallback', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Invalid API Key',
      } as Response)

      const result = await analyzeErrorWithAI('Error')

      expect(result).toContain('Error Analysis')
    })

    it('handles network error', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await analyzeErrorWithAI('Error')

      expect(result).toContain('## Error Analysis')
      expect(result).toContain('Check the browser console')
    })

    it('handles JSON parse error', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as unknown as Response)

      const result = await analyzeErrorWithAI('Error')

      expect(result).toContain('## Error Analysis')
    })

    it('handles missing content in response', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: {} }],
        }),
      } as Response)

      const result = await analyzeErrorWithAI('Error')

      expect(result).toContain('Unable to analyze error')
    })

    it('handles empty choices array', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [],
        }),
      } as Response)

      const result = await analyzeErrorWithAI('Error')

      expect(result).toContain('Unable to analyze error')
    })
  })

  describe('Parameter Handling', () => {
    it('handles undefined stack trace', async () => {
      localStorage.setItem('openai_api_key', 'test-key')
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      } as Response)

      await analyzeErrorWithAI('Error', undefined)

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse((callArgs[1] as RequestInit).body as string)
      // Should not include stack trace section
      expect(body.messages[1].content).not.toContain('undefined')
    })

    it('handles undefined context', async () => {
      localStorage.setItem('openai_api_key', 'test-key')
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      } as Response)

      await analyzeErrorWithAI('Error', 'stack', undefined)

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse((callArgs[1] as RequestInit).body as string)
      // Should not include context section
    })

    it('handles empty error message', async () => {
      const result = await analyzeErrorWithAI('')

      expect(result).toContain('## Error Analysis')
    })

    it('handles very long error message', async () => {
      const longError = 'A'.repeat(1000)
      const result = await analyzeErrorWithAI(longError)

      expect(result).toContain('## Error Analysis')
    })

    it('handles special characters in error', async () => {
      const result = await analyzeErrorWithAI('<>&"\'`')

      expect(result).toContain('## Error Analysis')
    })
  })

  describe('Response Handling', () => {
    it('extracts message content correctly', async () => {
      localStorage.setItem('openai_api_key', 'test-key')
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      const responseContent = 'Detailed error analysis'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: responseContent,
              },
            },
          ],
        }),
      } as Response)

      const result = await analyzeErrorWithAI('Error')

      expect(result).toBe(responseContent)
    })

    it('handles multiple choices (returns first)', async () => {
      localStorage.setItem('openai_api_key', 'test-key')
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            { message: { content: 'First choice' } },
            { message: { content: 'Second choice' } },
          ],
        }),
      } as Response)

      const result = await analyzeErrorWithAI('Error')

      expect(result).toBe('First choice')
    })
  })

  describe('Integration Tests', () => {
    it('complete workflow without API key', async () => {
      const errorMsg = 'TypeError: Cannot read property x'
      const context = 'During snippet save'

      const result = await analyzeErrorWithAI(errorMsg, undefined, context)

      expect(result).toContain('## Error Analysis')
      expect(result).toContain(errorMsg)
      expect(result).toContain(context)
      expect(result).toContain('Basic Troubleshooting')
    })

    it('complete workflow with API key', async () => {
      localStorage.setItem('openai_api_key', 'valid-key')
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content:
                  '## Analysis\n\nThe error occurred because...',
              },
            },
          ],
        }),
      } as Response)

      const result = await analyzeErrorWithAI(
        'Error message',
        'stack trace here',
        'Context info'
      )

      expect(result).toBe('## Analysis\n\nThe error occurred because...')
      expect(mockFetch).toHaveBeenCalled()
    })

    it('fallback on API key invalid', async () => {
      localStorage.setItem('openai_api_key', 'invalid-key')
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      } as Response)

      const result = await analyzeErrorWithAI('Error')

      expect(result).toContain('## Error Analysis')
      expect(result).toContain('Basic Troubleshooting')
    })
  })

  describe('Prompt Construction', () => {
    it('constructs prompt with all parameters', async () => {
      localStorage.setItem('openai_api_key', 'test-key')
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      } as Response)

      await analyzeErrorWithAI(
        'TypeError: x is undefined',
        'at foo.js:10',
        'User clicked save'
      )

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse((callArgs[1] as RequestInit).body as string)
      const prompt = body.messages[1].content

      expect(prompt).toContain('TypeError: x is undefined')
      expect(prompt).toContain('at foo.js:10')
      expect(prompt).toContain('User clicked save')
    })

    it('prompt requests structured analysis', async () => {
      localStorage.setItem('openai_api_key', 'test-key')
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Result' } }],
        }),
      } as Response)

      await analyzeErrorWithAI('Error')

      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse((callArgs[1] as RequestInit).body as string)
      const prompt = body.messages[1].content

      expect(prompt).toContain('clear explanation')
      expect(prompt).toContain('actionable steps')
      expect(prompt).toContain('markdown')
    })
  })

  describe('Error Logging', () => {
    it('logs error on API failure', async () => {
      localStorage.setItem('openai_api_key', 'test-key')
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await analyzeErrorWithAI('Error')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
