# Phase 3 Test Template & Procedures

This document provides test templates and manual testing procedures for Phase 3 implementations.

---

## Test Environment Setup

### Prerequisites
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Navigate to http://localhost:3000
```

### Test Data Setup
```bash
# Optional: Seed test data
npm run seed:test-data

# Or manually create test workflow through UI
```

---

## Test 1: useExecution Hook

### Test Suite Template (Jest)

```typescript
// src/hooks/__tests__/useExecution.test.ts

import { renderHook, act, waitFor } from '@testing-library/react';
import { useExecution } from '../useExecution';
import executionService from '../../services/executionService';
import { Provider } from 'react-redux';
import { store } from '../../store/store';

describe('useExecution', () => {
  // Wrapper component for Redux
  const wrapper = ({ children }: any) => (
    <Provider store={store}>{children}</Provider>
  );

  describe('execute', () => {
    it('should execute a workflow and return results', async () => {
      const { result } = renderHook(() => useExecution(), { wrapper });

      let executionResult;
      await act(async () => {
        executionResult = await result.current.execute('workflow-123');
      });

      expect(executionResult).toBeDefined();
      expect(executionResult.id).toBeDefined();
      expect(executionResult.status).toBe('running' || 'success');
    });

    it('should reject with error on invalid workflow ID', async () => {
      const { result } = renderHook(() => useExecution(), { wrapper });

      await expect(
        act(async () => {
          await result.current.execute('');
        })
      ).rejects.toThrow();
    });

    it('should dispatch execution state to Redux', async () => {
      const { result } = renderHook(() => useExecution(), { wrapper });

      await act(async () => {
        await result.current.execute('workflow-123');
      });

      expect(result.current.currentExecution).toBeDefined();
    });
  });

  describe('stop', () => {
    it('should stop a running execution', async () => {
      const { result } = renderHook(() => useExecution(), { wrapper });

      // Start execution
      await act(async () => {
        await result.current.execute('workflow-123');
      });

      // Stop execution
      await act(async () => {
        await result.current.stop();
      });

      expect(result.current.currentExecution?.status).toBe('stopped');
    });

    it('should throw error if no execution is running', async () => {
      const { result } = renderHook(() => useExecution(), { wrapper });

      await expect(
        act(async () => {
          await result.current.stop();
        })
      ).rejects.toThrow('No execution running');
    });
  });

  describe('getDetails', () => {
    it('should retrieve execution details', async () => {
      const { result } = renderHook(() => useExecution(), { wrapper });

      const details = await act(async () => {
        return await result.current.getDetails('exec-12345');
      });

      expect(details).toMatchObject({
        id: expect.any(String),
        status: expect.stringMatching(/pending|running|success|error|stopped/),
        startTime: expect.any(Number)
      });
    });

    it('should return null for non-existent execution', async () => {
      const { result } = renderHook(() => useExecution(), { wrapper });

      const details = await act(async () => {
        return await result.current.getDetails('non-existent-id');
      });

      expect(details).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return execution statistics', async () => {
      const { result } = renderHook(() => useExecution(), { wrapper });

      const stats = await act(async () => {
        return await result.current.getStats('workflow-123');
      });

      expect(stats).toMatchObject({
        totalExecutions: expect.any(Number),
        successCount: expect.any(Number),
        errorCount: expect.any(Number),
        averageDuration: expect.any(Number)
      });

      expect(stats.totalExecutions).toBeGreaterThanOrEqual(0);
      expect(stats.successCount + stats.errorCount).toBeLessThanOrEqual(
        stats.totalExecutions
      );
    });
  });

  describe('getHistory', () => {
    it('should return execution history', async () => {
      const { result } = renderHook(() => useExecution(), { wrapper });

      const history = await act(async () => {
        return await result.current.getHistory('workflow-123', 'default', 10);
      });

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(10);

      // Verify items are in reverse chronological order
      for (let i = 1; i < history.length; i++) {
        expect(history[i - 1].startTime).toBeGreaterThanOrEqual(history[i].startTime);
      }
    });

    it('should validate limit parameter', async () => {
      const { result } = renderHook(() => useExecution(), { wrapper });

      const history = await act(async () => {
        return await result.current.getHistory('workflow-123', 'default', 150);
      });

      // Should cap at 100
      expect(history.length).toBeLessThanOrEqual(100);
    });

    it('should return empty array for non-existent workflow', async () => {
      const { result } = renderHook(() => useExecution(), { wrapper });

      const history = await act(async () => {
        return await result.current.getHistory('non-existent-workflow');
      });

      expect(history).toEqual([]);
    });
  });

  describe('state selectors', () => {
    it('should return current execution from Redux', () => {
      const { result } = renderHook(() => useExecution(), { wrapper });

      expect(result.current.currentExecution).toBeDefined();
      expect(Array.isArray(result.current.executionHistory)).toBe(true);
    });
  });
});
```

### Manual Test Procedures

#### Procedure 1: Execute Workflow
```
Steps:
1. Navigate to project canvas
2. Select a workflow
3. Click "Execute" button
4. Observe loading state
5. Wait for completion
6. Verify result display

Expected Results:
- Loading spinner appears
- Execution status shown
- Result displayed after completion
- currentExecution state updates in Redux DevTools
```

#### Procedure 2: Stop Execution
```
Steps:
1. Start a workflow execution
2. While running, click "Stop" button
3. Observe execution state

Expected Results:
- Execution stops within 1-2 seconds
- Status changes to "stopped"
- Cannot click Stop again
```

#### Procedure 3: View History
```
Steps:
1. Navigate to execution history
2. Scroll through history list
3. Click on past execution
4. Verify details display

Expected Results:
- History sorted by newest first
- Details panel shows all fields
- Duration calculated correctly
- Error messages display if present
```

#### Procedure 4: View Statistics
```
Steps:
1. Navigate to workflow statistics
2. Observe success/error counts
3. Check average duration

Expected Results:
- Stats calculated correctly
- Success rate = successCount / totalExecutions
- Duration in human-readable format
```

---

## Test 2: useCanvasKeyboard Integration

### Test Suite Template

```typescript
// src/components/ProjectCanvas/InfiniteCanvas/__tests__/InfiniteCanvas.keyboard.test.ts

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InfiniteCanvas } from '../InfiniteCanvas';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';

describe('InfiniteCanvas - Keyboard Integration', () => {
  const wrapper = ({ children }: any) => (
    <Provider store={store}>{children}</Provider>
  );

  beforeEach(() => {
    // Setup canvas with test items
    const testItems = [
      { id: 'item-1', position: { x: 0, y: 0 }, size: { width: 100, height: 100 } },
      { id: 'item-2', position: { x: 150, y: 0 }, size: { width: 100, height: 100 } },
      { id: 'item-3', position: { x: 300, y: 0 }, size: { width: 100, height: 100 } }
    ];
    store.dispatch(setCanvasItems(testItems));
  });

  describe('Ctrl+A (Select All)', () => {
    it('should select all canvas items', async () => {
      const { container } = render(
        <InfiniteCanvas>
          <div>Canvas Content</div>
        </InfiniteCanvas>,
        { wrapper }
      );

      const canvas = container.querySelector('[class*="canvas"]');
      canvas?.focus();

      await userEvent.keyboard('{Control>}a{/Control}');

      // Verify all items selected in Redux
      const state = store.getState();
      expect(state.canvas.canvasState.selectedItemIds.size).toBe(3);
    });
  });

  describe('Delete (Delete Selected)', () => {
    it('should delete selected items', async () => {
      const { container } = render(
        <InfiniteCanvas>
          <div>Canvas Content</div>
        </InfiniteCanvas>,
        { wrapper }
      );

      // Select first item
      store.dispatch(selectCanvasItem('item-1'));

      const canvas = container.querySelector('[class*="canvas"]');
      canvas?.focus();

      await userEvent.keyboard('{Delete}');

      // Verify item deleted
      const state = store.getState();
      const items = state.canvasItems.canvasItems;
      expect(items.find((i: any) => i.id === 'item-1')).toBeUndefined();
    });

    it('should not delete when no items selected', async () => {
      const { container } = render(
        <InfiniteCanvas>
          <div>Canvas Content</div>
        </InfiniteCanvas>,
        { wrapper }
      );

      const initialCount = store.getState().canvasItems.canvasItems.length;

      const canvas = container.querySelector('[class*="canvas"]');
      canvas?.focus();

      await userEvent.keyboard('{Delete}');

      expect(store.getState().canvasItems.canvasItems.length).toBe(initialCount);
    });
  });

  describe('Ctrl+D (Duplicate)', () => {
    it('should duplicate selected items with offset', async () => {
      const { container } = render(
        <InfiniteCanvas>
          <div>Canvas Content</div>
        </InfiniteCanvas>,
        { wrapper }
      );

      store.dispatch(selectCanvasItem('item-1'));

      const canvas = container.querySelector('[class*="canvas"]');
      canvas?.focus();

      await userEvent.keyboard('{Control>}d{/Control}');

      const state = store.getState();
      const items = state.canvasItems.canvasItems;

      // Should have original + duplicate
      expect(items.length).toBe(4);

      // Duplicate should have offset position
      const duplicate = items.find((i: any) => i.id !== 'item-1' && i.position.x !== 0);
      expect(duplicate?.position.x).toBe(20);
      expect(duplicate?.position.y).toBe(20);
    });
  });

  describe('Escape (Clear Selection)', () => {
    it('should clear all selections', async () => {
      const { container } = render(
        <InfiniteCanvas>
          <div>Canvas Content</div>
        </InfiniteCanvas>,
        { wrapper }
      );

      store.dispatch(selectCanvasItem('item-1'));
      expect(store.getState().canvas.canvasState.selectedItemIds.size).toBe(1);

      const canvas = container.querySelector('[class*="canvas"]');
      canvas?.focus();

      await userEvent.keyboard('{Escape}');

      expect(store.getState().canvas.canvasState.selectedItemIds.size).toBe(0);
    });
  });

  describe('Arrow Keys (Pan)', () => {
    it('should pan canvas with arrow keys', async () => {
      const { container } = render(
        <InfiniteCanvas>
          <div>Canvas Content</div>
        </InfiniteCanvas>,
        { wrapper }
      );

      const initialPan = store.getState().canvas.canvasState.pan;

      const canvas = container.querySelector('[class*="canvas"]');
      canvas?.focus();

      await userEvent.keyboard('{ArrowRight}');

      const newPan = store.getState().canvas.canvasState.pan;
      expect(newPan.x).not.toBe(initialPan.x);
    });

    it('should not pan when input focused', async () => {
      const { container } = render(
        <InfiniteCanvas>
          <input data-testid="test-input" />
        </InfiniteCanvas>,
        { wrapper }
      );

      const input = screen.getByTestId('test-input');
      input.focus();

      const initialPan = store.getState().canvas.canvasState.pan;

      await userEvent.keyboard('{ArrowRight}');

      // Pan should not change since input is focused
      const newPan = store.getState().canvas.canvasState.pan;
      expect(newPan.x).toBe(initialPan.x);
    });
  });
});
```

### Manual Test Procedures

#### Procedure 1: Test Ctrl+A
```
Steps:
1. Create 3+ workflow cards on canvas
2. Click on canvas to focus
3. Press Ctrl+A (or Cmd+A on Mac)
4. Observe card selection state

Expected Results:
- All cards get selected (visual highlight)
- Canvas selection state updated
- Can see selected state in Redux DevTools
```

#### Procedure 2: Test Delete
```
Steps:
1. Create 3+ workflow cards
2. Select some cards (Ctrl+Click)
3. Press Delete or Backspace
4. Observe cards removed

Expected Results:
- Selected cards disappear
- Non-selected cards remain
- Redux state updated
- Cannot delete with no selection
```

#### Procedure 3: Test Ctrl+D Duplicate
```
Steps:
1. Create a workflow card
2. Click to select it
3. Press Ctrl+D (or Cmd+D on Mac)
4. Observe duplicate appears

Expected Results:
- Duplicate card appears
- Positioned 20px right and down from original
- Has new unique ID
- Original card unchanged
```

#### Procedure 4: Test Escape
```
Steps:
1. Select multiple cards
2. Press Escape
3. Observe selection state

Expected Results:
- All selections cleared
- Cards show no selection highlight
- Redux selection state cleared
```

#### Procedure 5: Test Arrow Keys
```
Steps:
1. Click on canvas background
2. Press arrow keys (up/down/left/right)
3. Observe canvas panning

Expected Results:
- Canvas view moves
- Cannot pan when input field focused
- Smooth panning without lag
```

---

## Test 3: useCanvasVirtualization

### Performance Test Template

```typescript
// Performance benchmark test

describe('useCanvasVirtualization - Performance', () => {
  it('should efficiently handle 1000+ items', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: `item-${i}`,
      position: { x: Math.random() * 10000, y: Math.random() * 10000 },
      size: { width: 100, height: 100 }
    }));

    const start = performance.now();

    const { visibleItems } = useCanvasVirtualization(
      items,
      { x: -500, y: -500 },
      1,
      { padding: 100, containerWidth: 1200, containerHeight: 800 }
    );

    const end = performance.now();

    // Should calculate visible items in < 10ms
    expect(end - start).toBeLessThan(10);

    // Should only render small subset
    expect(visibleItems.length).toBeLessThan(items.length);
    expect(visibleItems.length).toBeGreaterThan(0);
  });
});
```

### Manual Performance Test

```
Steps:
1. Create workflow with 100+ cards
2. Open browser DevTools > Performance tab
3. Start recording
4. Pan and zoom canvas
5. Stop recording
6. Analyze frame rate

Expected Results:
- Frames Per Second (FPS) >= 60
- Only visible items rendered
- Memory usage stable during panning
- No jank or stuttering
```

---

## Test 4: useRealtimeService

### Mock WebSocket Test Template

```typescript
describe('useRealtimeService - Realtime Collaboration', () => {
  // Mock WebSocket
  global.WebSocket = jest.fn();

  it('should initialize connection on mount', () => {
    const { result } = renderHook(
      () => useRealtimeService({ projectId: 'test-project' }),
      { wrapper: Provider }
    );

    expect(result.current.isConnected).toBe(true);
  });

  it('should broadcast canvas updates', () => {
    const { result } = renderHook(
      () => useRealtimeService({ projectId: 'test-project' }),
      { wrapper: Provider }
    );

    const broadcastSpy = jest.spyOn(realtimeService, 'broadcastCanvasUpdate');

    act(() => {
      result.current.broadcastCanvasUpdate('item-1', { x: 100, y: 100 }, { width: 50, height: 50 });
    });

    expect(broadcastSpy).toHaveBeenCalled();
  });

  it('should lock items during editing', () => {
    const { result } = renderHook(
      () => useRealtimeService({ projectId: 'test-project' }),
      { wrapper: Provider }
    );

    act(() => {
      result.current.lockCanvasItem('item-1');
    });

    const state = store.getState();
    expect(state.realtime.lockedItems['item-1']).toBeDefined();
  });
});
```

---

## Automated Test Runner

### Run All Phase 3 Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test src/hooks/__tests__/useExecution.test.ts

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test:watch
```

---

## Regression Testing Checklist

- [ ] All Phase 2 hooks still work
- [ ] Redux store initializes correctly
- [ ] No console errors on app load
- [ ] Canvas renders without errors
- [ ] Keyboard shortcuts don't interfere with normal typing
- [ ] Execution service calls work
- [ ] Realtime events don't break canvas
- [ ] Build completes successfully
- [ ] Type checking passes
- [ ] No performance degradation

---

## Continuous Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/phase-3-tests.yml
name: Phase 3 Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run type-check
      - run: npm run build
      - run: npm run test -- --coverage
```

---

## Notes

- Update mock data URLs as needed
- Adjust timeouts for CI environment
- Consider splitting tests into separate files
- Use factories for test data generation

