/**
 * Tests for dbApiCalls - raw API calls for database management
 */

jest.mock('@/lib/app-config', () => ({
  BASE_PATH: '/workflowui',
}))

global.fetch = jest.fn()

import { testConnection, applyDbConfig } from '../dbApiCalls'

describe('dbApiCalls', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('testConnection', () => {
    it('should POST to /api/dbal/admin/test-connection', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ success: true, message: 'Connected' }),
      })

      await testConnection('postgres', { host: 'localhost', database: 'db' })

      expect(global.fetch).toHaveBeenCalledWith(
        '/workflowui/api/dbal/admin/test-connection',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should return ok: true on success', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ success: true, message: 'Connected successfully' }),
      })

      const result = await testConnection('postgres', {})
      expect(result.ok).toBe(true)
      expect(result.message).toBe('Connected successfully')
    })

    it('should return ok: false on failure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ success: false, error: 'Connection refused' }),
      })

      const result = await testConnection('postgres', {})
      expect(result.ok).toBe(false)
      expect(result.message).toBe('Connection refused')
    })

    it('should use "Unknown result" when no message or error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ success: false }),
      })

      const result = await testConnection('postgres', {})
      expect(result.message).toBe('Unknown result')
    })

    it('should send adapter and database_url in body', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      })

      await testConnection('sqlite', { path: '/data/db.sqlite' })

      const call = (global.fetch as jest.Mock).mock.calls[0]
      const body = JSON.parse(call[1].body)
      expect(body.adapter).toBe('sqlite')
      expect(body.database_url).toContain('sqlite://')
    })

    it('should set Content-Type header', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      })

      await testConnection('postgres', {})

      const call = (global.fetch as jest.Mock).mock.calls[0]
      expect(call[1].headers['Content-Type']).toBe('application/json')
    })
  })

  describe('applyDbConfig', () => {
    it('should POST to /api/dbal/admin/config', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ success: true, message: 'Applied' }),
      })

      await applyDbConfig('postgres', {})

      expect(global.fetch).toHaveBeenCalledWith(
        '/workflowui/api/dbal/admin/config',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should return ok: true on success', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ success: true, message: 'Config applied' }),
      })

      const result = await applyDbConfig('mysql', {})
      expect(result.ok).toBe(true)
      expect(result.message).toBe('Config applied')
    })

    it('should return ok: false on failure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ success: false, error: 'Permission denied' }),
      })

      const result = await applyDbConfig('mysql', {})
      expect(result.ok).toBe(false)
      expect(result.message).toBe('Permission denied')
    })
  })
})
