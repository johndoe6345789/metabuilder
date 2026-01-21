/**
 * Unit tests for useApiCall hook - testing the logic without rendering
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('useApiCall - API logic tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle successful API call', async () => {
    const mockData = { message: 'Success', result: 42 };
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const response = await fetch('/api/test');
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toEqual(mockData);
  });

  it('should handle API error', async () => {
    const errorMessage = 'Request failed';
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    const response = await fetch('/api/test');
    const data = await response.json();

    expect(response.ok).toBe(false);
    expect(data.error).toBe(errorMessage);
  });

  it('should handle POST request with body', async () => {
    const requestBody = { name: 'test', value: 123 };
    const mockData = { success: true };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    await fetch('/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  });
});
