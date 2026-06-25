import { setAuthToken, getAuthToken } from './authToken'

describe('authToken', () => {
  afterEach(() => {
    // Reset to null after each test to avoid cross-test pollution
    setAuthToken(null)
  })

  it('initially returns null', () => {
    setAuthToken(null)
    expect(getAuthToken()).toBeNull()
  })

  it('stores and retrieves a token', () => {
    setAuthToken('my-jwt-token')
    expect(getAuthToken()).toBe('my-jwt-token')
  })

  it('replaces an existing token', () => {
    setAuthToken('first')
    setAuthToken('second')
    expect(getAuthToken()).toBe('second')
  })

  it('clears the token when set to null', () => {
    setAuthToken('some-token')
    setAuthToken(null)
    expect(getAuthToken()).toBeNull()
  })

  it('stores empty string token', () => {
    setAuthToken('')
    expect(getAuthToken()).toBe('')
  })
})
