/**
 * Tests for usePlugins and usePluginFilter hooks
 */

import { renderHook, act } from '@testing-library/react';
import { usePlugins } from '../usePlugins';
import { usePluginFilter } from '../usePluginFilter';

// usePluginFilter tests (pure filtering logic)
describe('usePluginFilter', () => {
  it('returns all plugins when no filters applied', () => {
    const { result } = renderHook(() =>
      usePluginFilter({ searchQuery: '', selectedTab: 'all', selectedCategory: null })
    );
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('filters to only installed plugins when tab is "installed"', () => {
    const { result } = renderHook(() =>
      usePluginFilter({ searchQuery: '', selectedTab: 'installed', selectedCategory: null })
    );
    result.current.forEach((p) => expect(p.installed).toBe(true));
  });

  it('filters to only non-installed plugins when tab is "available"', () => {
    const { result } = renderHook(() =>
      usePluginFilter({ searchQuery: '', selectedTab: 'available', selectedCategory: null })
    );
    result.current.forEach((p) => expect(p.installed).toBe(false));
  });

  it('filters by category', () => {
    // Get a real category from the first plugin
    const { result: allResult } = renderHook(() =>
      usePluginFilter({ searchQuery: '', selectedTab: 'all', selectedCategory: null })
    );
    if (allResult.current.length === 0) return;
    const targetCategory = allResult.current[0].category;

    const { result } = renderHook(() =>
      usePluginFilter({ searchQuery: '', selectedTab: 'all', selectedCategory: targetCategory })
    );
    result.current.forEach((p) => expect(p.category).toBe(targetCategory));
  });

  it('filters by search query matching name', () => {
    const { result: allResult } = renderHook(() =>
      usePluginFilter({ searchQuery: '', selectedTab: 'all', selectedCategory: null })
    );
    if (allResult.current.length === 0) return;
    const firstName = allResult.current[0].name;
    const query = firstName.substring(0, 3).toLowerCase();

    const { result } = renderHook(() =>
      usePluginFilter({ searchQuery: query, selectedTab: 'all', selectedCategory: null })
    );
    result.current.forEach((p) =>
      expect(
        p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      ).toBe(true)
    );
  });

  it('returns empty array when search query matches nothing', () => {
    const { result } = renderHook(() =>
      usePluginFilter({
        searchQuery: 'zzz_no_match_zzz',
        selectedTab: 'all',
        selectedCategory: null,
      })
    );
    expect(result.current).toHaveLength(0);
  });
});

// usePlugins tests
describe('usePlugins', () => {
  it('starts with empty searchQuery', () => {
    const { result } = renderHook(() => usePlugins());
    expect(result.current.searchQuery).toBe('');
  });

  it('starts with selectedTab "all"', () => {
    const { result } = renderHook(() => usePlugins());
    expect(result.current.selectedTab).toBe('all');
  });

  it('starts with detailDialogOpen false', () => {
    const { result } = renderHook(() => usePlugins());
    expect(result.current.detailDialogOpen).toBe(false);
  });

  it('starts with selectedPlugin null', () => {
    const { result } = renderHook(() => usePlugins());
    expect(result.current.selectedPlugin).toBeNull();
  });

  it('setSearchQuery updates searchQuery', () => {
    const { result } = renderHook(() => usePlugins());
    act(() => {
      result.current.setSearchQuery('http');
    });
    expect(result.current.searchQuery).toBe('http');
  });

  it('setSelectedTab updates selectedTab', () => {
    const { result } = renderHook(() => usePlugins());
    act(() => {
      result.current.setSelectedTab('installed');
    });
    expect(result.current.selectedTab).toBe('installed');
  });

  it('handlePluginClick opens dialog with selected plugin', () => {
    const { result } = renderHook(() => usePlugins());
    const plugin = result.current.filteredPlugins[0];
    if (!plugin) return;
    act(() => {
      result.current.handlePluginClick(plugin);
    });
    expect(result.current.detailDialogOpen).toBe(true);
    expect(result.current.selectedPlugin).toBe(plugin);
  });

  it('handleInstallToggle closes the dialog', () => {
    const { result } = renderHook(() => usePlugins());
    const plugin = result.current.filteredPlugins[0];
    if (!plugin) return;
    act(() => {
      result.current.handlePluginClick(plugin);
    });
    act(() => {
      result.current.handleInstallToggle();
    });
    expect(result.current.detailDialogOpen).toBe(false);
  });

  it('handleResetFilters resets all filters', () => {
    const { result } = renderHook(() => usePlugins());
    act(() => {
      result.current.setSearchQuery('test');
      result.current.setSelectedTab('installed');
      result.current.setSelectedCategory('http');
    });
    act(() => {
      result.current.handleResetFilters();
    });
    expect(result.current.searchQuery).toBe('');
    expect(result.current.selectedTab).toBe('all');
    expect(result.current.selectedCategory).toBeNull();
  });

  it('stats contains totalPlugins, installedPlugins, totalDownloads', () => {
    const { result } = renderHook(() => usePlugins());
    expect(typeof result.current.stats.totalPlugins).toBe('number');
    expect(typeof result.current.stats.installedPlugins).toBe('number');
    expect(typeof result.current.stats.totalDownloads).toBe('number');
  });

  it('tabsWithCounts has count for each tab', () => {
    const { result } = renderHook(() => usePlugins());
    result.current.tabsWithCounts.forEach((t) => {
      expect(typeof t.count).toBe('number');
    });
  });
});
