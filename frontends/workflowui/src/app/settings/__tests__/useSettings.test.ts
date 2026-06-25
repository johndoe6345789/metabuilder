/**
 * Tests for useSettings hook
 */

import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../hooks/useSettings';

describe('useSettings', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes activeTab to 0', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.activeTab).toBe(0);
  });

  it('initializes theme to "system"', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.theme).toBe('system');
  });

  it('initializes language to "en"', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.language).toBe('en');
  });

  it('initializes notifications to true', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.notifications).toBe(true);
  });

  it('initializes emailUpdates to false', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.emailUpdates).toBe(false);
  });

  it('initializes autoSave to true', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.autoSave).toBe(true);
  });

  it('initializes defaultExecutor to "typescript"', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.defaultExecutor).toBe('typescript');
  });

  it('initializes workflowTimeout to "300"', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.workflowTimeout).toBe('300');
  });

  it('initializes deleteDialogOpen to false', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.deleteDialogOpen).toBe(false);
  });

  it('initializes saveSuccess to false', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.saveSuccess).toBe(false);
  });

  it('setTheme updates theme', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setTheme('dark');
    });
    expect(result.current.theme).toBe('dark');
  });

  it('setLanguage updates language', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setLanguage('es');
    });
    expect(result.current.language).toBe('es');
  });

  it('setNotifications updates notifications', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setNotifications(false);
    });
    expect(result.current.notifications).toBe(false);
  });

  it('handleTabChange updates activeTab', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.handleTabChange({} as any, 3);
    });
    expect(result.current.activeTab).toBe(3);
  });

  it('handleSavePreferences sets saveSuccess to true', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.handleSavePreferences();
    });
    expect(result.current.saveSuccess).toBe(true);
  });

  it('handleSavePreferences resets saveSuccess after timeout', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.handleSavePreferences();
    });
    expect(result.current.saveSuccess).toBe(true);
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.saveSuccess).toBe(false);
  });

  it('handleDeleteAccount closes dialog', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setDeleteDialogOpen(true);
    });
    expect(result.current.deleteDialogOpen).toBe(true);
    act(() => {
      result.current.handleDeleteAccount();
    });
    expect(result.current.deleteDialogOpen).toBe(false);
  });

  it('setDeleteDialogOpen opens dialog', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setDeleteDialogOpen(true);
    });
    expect(result.current.deleteDialogOpen).toBe(true);
  });

  it('setAutoSave updates autoSave', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setAutoSave(false);
    });
    expect(result.current.autoSave).toBe(false);
  });

  it('setWorkflowTimeout updates workflowTimeout', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setWorkflowTimeout('600');
    });
    expect(result.current.workflowTimeout).toBe('600');
  });

  it('setDefaultExecutor updates defaultExecutor', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setDefaultExecutor('python');
    });
    expect(result.current.defaultExecutor).toBe('python');
  });

  it('setEmailUpdates updates emailUpdates', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.setEmailUpdates(true);
    });
    expect(result.current.emailUpdates).toBe(true);
  });
});
