import {
  runCodeViaFlask,
  runPythonViaFlask,
  startInteractiveSession,
  pollSession,
  sendSessionInput,
  isFlaskRunnerAvailable,
} from './flask-runner'
import { setAuthToken } from './authToken'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockOkResponse(body: object, status = 200) {
  return jest.fn().mockResolvedValue({
    ok: true,
    status,
    json: () => Promise.resolve(body),
    statusText: 'OK',
  })
}

function mockErrorResponse(status: number, body?: object) {
  return jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => (body ? Promise.resolve(body) : Promise.reject(new Error('no body'))),
    statusText: 'Bad Request',
  })
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const BASE = 'http://localhost:5001'

beforeEach(() => {
  process.env.NEXT_PUBLIC_FLASK_BACKEND_URL = BASE
  setAuthToken(null)
  jest.clearAllMocks()
})

afterEach(() => {
  delete process.env.NEXT_PUBLIC_FLASK_BACKEND_URL
})

// ---------------------------------------------------------------------------
// isFlaskRunnerAvailable
// ---------------------------------------------------------------------------

describe('isFlaskRunnerAvailable', () => {
  it('returns true when env var is set', () => {
    expect(isFlaskRunnerAvailable()).toBe(true)
  })

  it('returns false when env var is not set', () => {
    delete process.env.NEXT_PUBLIC_FLASK_BACKEND_URL
    expect(isFlaskRunnerAvailable()).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// runCodeViaFlask — auth header tests (the bug that went undetected)
// ---------------------------------------------------------------------------

describe('runCodeViaFlask', () => {
  describe('auth header', () => {
    it('sends Authorization header when token is set', async () => {
      setAuthToken('my-jwt-token')
      global.fetch = mockOkResponse({ output: '', error: null })

      await runCodeViaFlask({ language: 'python', files: [{ name: 'main.py', content: 'pass' }] })

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(options.headers['Authorization']).toBe('Bearer my-jwt-token')
    })

    it('does NOT send Authorization header when no token', async () => {
      setAuthToken(null)
      global.fetch = mockOkResponse({ output: '', error: null })

      await runCodeViaFlask({ language: 'python', files: [{ name: 'main.py', content: 'pass' }] })

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(options.headers['Authorization']).toBeUndefined()
    })

    it('sends Content-Type: application/json', async () => {
      global.fetch = mockOkResponse({ output: '', error: null })

      await runCodeViaFlask({ language: 'python', files: [] })

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(options.headers['Content-Type']).toBe('application/json')
    })
  })

  describe('request payload', () => {
    it('POSTs to /api/run', async () => {
      global.fetch = mockOkResponse({ output: 'ok', error: null })

      await runCodeViaFlask({ language: 'python', files: [{ name: 'main.py', content: 'pass' }] })

      const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toBe(`${BASE}/api/run`)
      expect(options.method).toBe('POST')
    })

    it('sends language and files in body', async () => {
      global.fetch = mockOkResponse({ output: '', error: null })

      const files = [{ name: 'main.py', content: 'print("hi")' }]
      await runCodeViaFlask({ language: 'python', files })

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      const body = JSON.parse(options.body)
      expect(body.language).toBe('python')
      expect(body.files).toEqual(files)
    })

    it('includes entryPoint when provided', async () => {
      global.fetch = mockOkResponse({ output: '', error: null })

      await runCodeViaFlask({ language: 'python', files: [], entryPoint: 'main.py' })

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      const body = JSON.parse(options.body)
      expect(body.entryPoint).toBe('main.py')
    })
  })

  describe('response handling', () => {
    it('returns output and error from response', async () => {
      global.fetch = mockOkResponse({ output: 'Hello World', error: null })

      const result = await runCodeViaFlask({ language: 'python', files: [] })

      expect(result.output).toBe('Hello World')
      expect(result.error).toBeNull()
    })

    it('returns error from response', async () => {
      global.fetch = mockOkResponse({ output: '', error: 'SyntaxError: bad code' })

      const result = await runCodeViaFlask({ language: 'python', files: [] })

      expect(result.error).toBe('SyntaxError: bad code')
    })

    it('defaults output to empty string when missing', async () => {
      global.fetch = mockOkResponse({})

      const result = await runCodeViaFlask({ language: 'python', files: [] })

      expect(result.output).toBe('')
    })

    it('throws on non-OK response (not 408)', async () => {
      global.fetch = mockErrorResponse(500, { error: 'Internal server error' })

      await expect(
        runCodeViaFlask({ language: 'python', files: [] })
      ).rejects.toThrow('Internal server error')
    })

    it('does not throw on 408 timeout response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 408,
        json: () => Promise.resolve({ output: '', error: 'timeout' }),
        statusText: 'Request Timeout',
      })

      const result = await runCodeViaFlask({ language: 'python', files: [] })
      expect(result).toBeDefined()
    })

    it('throws generic error when no body on server error', async () => {
      global.fetch = mockErrorResponse(503)

      await expect(
        runCodeViaFlask({ language: 'python', files: [] })
      ).rejects.toThrow(/Server error/)
    })
  })

  describe('env var missing', () => {
    it('throws when NEXT_PUBLIC_FLASK_BACKEND_URL not set', async () => {
      delete process.env.NEXT_PUBLIC_FLASK_BACKEND_URL

      await expect(
        runCodeViaFlask({ language: 'python', files: [] })
      ).rejects.toThrow(/Flask backend not configured/)
    })
  })
})

// ---------------------------------------------------------------------------
// runPythonViaFlask (deprecated alias)
// ---------------------------------------------------------------------------

describe('runPythonViaFlask', () => {
  it('delegates to runCodeViaFlask with language=python and main.py', async () => {
    global.fetch = mockOkResponse({ output: 'result', error: null })

    const result = await runPythonViaFlask('print("hi")')

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
    const body = JSON.parse(options.body)
    expect(url).toBe(`${BASE}/api/run`)
    expect(body.language).toBe('python')
    expect(body.files).toEqual([{ name: 'main.py', content: 'print("hi")' }])
    expect(result.output).toBe('result')
  })

  it('sends auth header when token is set', async () => {
    setAuthToken('tok-123')
    global.fetch = mockOkResponse({ output: '', error: null })

    await runPythonViaFlask('pass')

    const [, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(options.headers['Authorization']).toBe('Bearer tok-123')
  })
})

// ---------------------------------------------------------------------------
// startInteractiveSession
// ---------------------------------------------------------------------------

describe('startInteractiveSession', () => {
  describe('auth header', () => {
    it('sends Authorization header when token is set', async () => {
      setAuthToken('sess-token')
      global.fetch = mockOkResponse({ session_id: 'abc' })

      await startInteractiveSession({ language: 'python', files: [] })

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(options.headers['Authorization']).toBe('Bearer sess-token')
    })

    it('omits Authorization header when no token', async () => {
      global.fetch = mockOkResponse({ session_id: 'abc' })

      await startInteractiveSession({ language: 'python', files: [] })

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(options.headers['Authorization']).toBeUndefined()
    })
  })

  describe('request', () => {
    it('POSTs to /api/run/interactive', async () => {
      global.fetch = mockOkResponse({ session_id: 'abc' })

      await startInteractiveSession({ language: 'python', files: [] })

      const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toBe(`${BASE}/api/run/interactive`)
      expect(options.method).toBe('POST')
    })

    it('sends language and files in body', async () => {
      global.fetch = mockOkResponse({ session_id: 'xyz' })

      const files = [{ name: 'app.py', content: 'x = input()' }]
      await startInteractiveSession({ language: 'python', files })

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      const body = JSON.parse(options.body)
      expect(body.language).toBe('python')
      expect(body.files).toEqual(files)
    })
  })

  describe('response', () => {
    it('returns session_id from response', async () => {
      global.fetch = mockOkResponse({ session_id: 'my-session-id' })

      const sid = await startInteractiveSession({ language: 'python', files: [] })

      expect(sid).toBe('my-session-id')
    })

    it('throws on non-OK response', async () => {
      global.fetch = mockErrorResponse(401, { error: 'Unauthorized' })

      await expect(
        startInteractiveSession({ language: 'python', files: [] })
      ).rejects.toThrow('Unauthorized')
    })

    it('throws with statusText when no body on error', async () => {
      global.fetch = mockErrorResponse(502)

      await expect(
        startInteractiveSession({ language: 'python', files: [] })
      ).rejects.toThrow(/Failed to start session/)
    })
  })
})

// ---------------------------------------------------------------------------
// pollSession
// ---------------------------------------------------------------------------

describe('pollSession', () => {
  describe('auth header', () => {
    it('sends Authorization header when token set', async () => {
      setAuthToken('poll-tok')
      global.fetch = mockOkResponse({ output: [], waiting_for_input: false, done: true })

      await pollSession('sess-1', 0)

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(options.headers['Authorization']).toBe('Bearer poll-tok')
    })

    it('omits Authorization header when no token', async () => {
      global.fetch = mockOkResponse({ output: [], waiting_for_input: false, done: true })

      await pollSession('sess-1', 0)

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(options.headers['Authorization']).toBeUndefined()
    })
  })

  describe('request', () => {
    it('GETs correct URL with offset', async () => {
      global.fetch = mockOkResponse({ output: [], waiting_for_input: false, done: true })

      await pollSession('sess-42', 7)

      const [url] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toBe(`${BASE}/api/run/interactive/sess-42/poll?offset=7`)
    })

    it('uses GET (no method property = default GET)', async () => {
      global.fetch = mockOkResponse({ output: [], waiting_for_input: false, done: false })

      await pollSession('s', 0)

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(options.method).toBeUndefined()
    })
  })

  describe('response', () => {
    it('returns poll result', async () => {
      const data = {
        output: [{ type: 'out', text: 'hello' }],
        waiting_for_input: false,
        done: true,
      }
      global.fetch = mockOkResponse(data)

      const result = await pollSession('s', 0)

      expect(result.output).toEqual(data.output)
      expect(result.done).toBe(true)
      expect(result.waiting_for_input).toBe(false)
    })

    it('throws on non-OK response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({}),
      })

      await expect(pollSession('s', 0)).rejects.toThrow('Poll failed')
    })
  })
})

// ---------------------------------------------------------------------------
// sendSessionInput
// ---------------------------------------------------------------------------

describe('sendSessionInput', () => {
  describe('auth header', () => {
    it('sends Authorization header when token set', async () => {
      setAuthToken('input-tok')
      global.fetch = mockOkResponse({})

      await sendSessionInput('sess-1', 'hello')

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(options.headers['Authorization']).toBe('Bearer input-tok')
    })

    it('omits Authorization header when no token', async () => {
      global.fetch = mockOkResponse({})

      await sendSessionInput('sess-1', 'hello')

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(options.headers['Authorization']).toBeUndefined()
    })
  })

  describe('request', () => {
    it('POSTs to correct URL', async () => {
      global.fetch = mockOkResponse({})

      await sendSessionInput('sess-99', 'Alice')

      const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toBe(`${BASE}/api/run/interactive/sess-99/input`)
      expect(options.method).toBe('POST')
    })

    it('sends value in body', async () => {
      global.fetch = mockOkResponse({})

      await sendSessionInput('sess-1', 'my input value')

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      const body = JSON.parse(options.body)
      expect(body.value).toBe('my input value')
    })
  })

  describe('response', () => {
    it('resolves without return value on success', async () => {
      global.fetch = mockOkResponse({})

      const result = await sendSessionInput('sess-1', 'test')

      expect(result).toBeUndefined()
    })

    it('throws on non-OK response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({}),
      })

      await expect(sendSessionInput('sess-1', 'val')).rejects.toThrow('Send input failed')
    })
  })
})
