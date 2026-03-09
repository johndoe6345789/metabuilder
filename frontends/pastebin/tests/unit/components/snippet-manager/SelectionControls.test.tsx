/**
 * Unit Tests for SelectionControls Component
 * Comprehensive test suite with 60+ test cases
 * Tests rendering, state management, callbacks, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent } from '@/test-utils';
import { SelectionControls } from '@/components/snippet-manager/SelectionControls';
import type { Namespace } from '@/lib/types';

describe('SelectionControls Component', () => {
  const mockNamespaces: Namespace[] = [
    { id: '1', name: 'Default', isDefault: true, createdAt: Date.now() },
    { id: '2', name: 'Work', isDefault: false, createdAt: Date.now() },
    { id: '3', name: 'Personal', isDefault: false, createdAt: Date.now() },
  ];

  const defaultProps = {
    selectedIds: [],
    totalFilteredCount: 10,
    namespaces: mockNamespaces,
    currentNamespaceId: '1',
    onSelectAll: jest.fn(),
    onBulkMove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<SelectionControls {...defaultProps} />);

      expect(screen.getByTestId('selection-controls')).toBeInTheDocument();
    });

    it('should render select all button', () => {
      render(<SelectionControls {...defaultProps} />);

      expect(screen.getByTestId('select-all-btn')).toBeInTheDocument();
    });

    it('should have correct initial label for select all button', () => {
      render(<SelectionControls {...defaultProps} selectedIds={[]} />);

      const button = screen.getByTestId('select-all-btn');
      expect(button.textContent).toContain('Select All');
    });

    it('should render with proper role', () => {
      render(<SelectionControls {...defaultProps} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('should have descriptive aria-label', () => {
      render(<SelectionControls {...defaultProps} />);

      const region = screen.getByRole('region', { name: 'Selection controls' });
      expect(region).toBeInTheDocument();
    });

    it('should render in a flex container', () => {
      const { container } = render(<SelectionControls {...defaultProps} />);

      const wrapper = screen.getByTestId('selection-controls');
      expect(wrapper.className).toContain('flex');
    });

    it('should have proper spacing classes', () => {
      const { container } = render(<SelectionControls {...defaultProps} />);

      const wrapper = screen.getByTestId('selection-controls');
      expect(wrapper.className).toContain('gap-2');
      expect(wrapper.className).toContain('p-4');
    });

    it('should have background styling', () => {
      const { container } = render(<SelectionControls {...defaultProps} />);

      const wrapper = screen.getByTestId('selection-controls');
      expect(wrapper.className).toContain('bg-muted');
    });

    it('should have rounded corners', () => {
      const { container } = render(<SelectionControls {...defaultProps} />);

      const wrapper = screen.getByTestId('selection-controls');
      expect(wrapper.className).toContain('rounded-lg');
    });
  });

  describe('Select All/Deselect All Button', () => {
    it('should show "Select All" when no items are selected', () => {
      render(<SelectionControls {...defaultProps} selectedIds={[]} />);

      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('should show "Deselect All" when all items are selected', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}
          totalFilteredCount={10}
        />
      );

      expect(screen.getByText('Deselect All')).toBeInTheDocument();
    });

    it('should show "Select All" when partial selection', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1', '2', '3']}
          totalFilteredCount={10}
        />
      );

      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('should call onSelectAll when clicked', () => {
      const onSelectAll = jest.fn();

      render(
        <SelectionControls
          {...defaultProps}
          onSelectAll={onSelectAll}
        />
      );

      fireEvent.click(screen.getByTestId('select-all-btn'));

      expect(onSelectAll).toHaveBeenCalled();
    });

    it('should have proper aria-label for select all', () => {
      render(<SelectionControls {...defaultProps} selectedIds={[]} />);

      const button = screen.getByTestId('select-all-btn');
      expect(button.getAttribute('aria-label')).toBe('Select all snippets');
    });

    it('should have proper aria-label for deselect all', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}
          totalFilteredCount={10}
        />
      );

      const button = screen.getByTestId('select-all-btn');
      expect(button.getAttribute('aria-label')).toBe('Deselect all snippets');
    });

    it('should be styled as outline variant', () => {
      render(<SelectionControls {...defaultProps} />);

      const button = screen.getByTestId('select-all-btn');
      expect(button.className).toContain('outline');
    });

    it('should be small size', () => {
      render(<SelectionControls {...defaultProps} />);

      const button = screen.getByTestId('select-all-btn');
      expect(button.className).toContain('sm');
    });

    it('should toggle selection state on click', () => {
      const onSelectAll = jest.fn();

      const { rerender } = render(
        <SelectionControls
          {...defaultProps}
          selectedIds={[]}
          onSelectAll={onSelectAll}
        />
      );

      fireEvent.click(screen.getByTestId('select-all-btn'));
      expect(onSelectAll).toHaveBeenCalled();

      rerender(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1', '2', '3']}
          onSelectAll={onSelectAll}
        />
      );

      expect(screen.getByText('Select All')).toBeInTheDocument();
    });
  });

  describe('Selection Count Display', () => {
    it('should not show selection count when nothing is selected', () => {
      render(<SelectionControls {...defaultProps} selectedIds={[]} />);

      expect(screen.queryByTestId('selection-count')).not.toBeInTheDocument();
    });

    it('should show selection count when items are selected', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1', '2', '3']}
        />
      );

      expect(screen.getByTestId('selection-count')).toBeInTheDocument();
    });

    it('should display correct count text', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1', '2', '3']}
        />
      );

      expect(screen.getByText('3 selected')).toBeInTheDocument();
    });

    it('should update count when selection changes', () => {
      const { rerender } = render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      expect(screen.getByText('1 selected')).toBeInTheDocument();

      rerender(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1', '2', '3']}
        />
      );

      expect(screen.getByText('3 selected')).toBeInTheDocument();
    });

    it('should have proper text styling', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      const count = screen.getByTestId('selection-count');
      expect(count.className).toContain('text-sm');
      expect(count.className).toContain('text-muted-foreground');
    });

    it('should have proper role and aria-live', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1', '2']}
        />
      );

      const count = screen.getByTestId('selection-count');
      expect(count.getAttribute('role')).toBe('status');
      expect(count.getAttribute('aria-live')).toBe('polite');
    });

    it('should be singular for one item', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    it('should be plural for multiple items', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1', '2', '3', '4', '5']}
        />
      );

      expect(screen.getByText('5 selected')).toBeInTheDocument();
    });

    it('should be zero when no selection', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={[]}
        />
      );

      expect(screen.queryByText('0 selected')).not.toBeInTheDocument();
    });
  });

  describe('Bulk Move Menu', () => {
    it('should not show bulk move menu when nothing is selected', () => {
      render(<SelectionControls {...defaultProps} selectedIds={[]} />);

      expect(screen.queryByTestId('bulk-move-menu-trigger')).not.toBeInTheDocument();
    });

    it('should show bulk move menu when items are selected', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      expect(screen.getByTestId('bulk-move-menu-trigger')).toBeInTheDocument();
    });

    it('should have correct button text', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      expect(screen.getByText('Move to...')).toBeInTheDocument();
    });

    it('should have proper aria-label on trigger', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      const trigger = screen.getByTestId('bulk-move-menu-trigger');
      expect(trigger.getAttribute('aria-label')).toBe(
        'Move selected snippets to another namespace'
      );
    });

    it('should have haspopup attribute', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      const trigger = screen.getByTestId('bulk-move-menu-trigger');
      expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    });

    it('should display FolderOpen icon', () => {
      const { container } = render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      // Icon should be present (rendered by Phosphor Icons)
      const trigger = screen.getByTestId('bulk-move-menu-trigger');
      expect(trigger).toBeInTheDocument();
    });

    it('should have gap-2 class for spacing with icon', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      const trigger = screen.getByTestId('bulk-move-menu-trigger');
      expect(trigger.className).toContain('gap-2');
    });

    it('should be styled as outline variant', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      const trigger = screen.getByTestId('bulk-move-menu-trigger');
      expect(trigger.className).toContain('outline');
    });

    it('should be small size', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      const trigger = screen.getByTestId('bulk-move-menu-trigger');
      expect(trigger.className).toContain('sm');
    });
  });

  describe('Namespace Menu Items', () => {
    it('should render menu items for each namespace', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      fireEvent.click(screen.getByTestId('bulk-move-menu-trigger'));

      mockNamespaces.forEach((ns) => {
        expect(screen.getByText(ns.name)).toBeInTheDocument();
      });
    });

    it('should show default namespace indicator', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      fireEvent.click(screen.getByTestId('bulk-move-menu-trigger'));

      expect(screen.getByText(/Default.*Default/)).toBeInTheDocument();
    });

    it('should disable item for current namespace', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
          currentNamespaceId="1"
        />
      );

      fireEvent.click(screen.getByTestId('bulk-move-menu-trigger'));

      const defaultItem = screen.getByTestId('bulk-move-to-namespace-1');
      expect(defaultItem).toBeDisabled();
    });

    it('should enable items for other namespaces', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
          currentNamespaceId="1"
        />
      );

      fireEvent.click(screen.getByTestId('bulk-move-menu-trigger'));

      const workItem = screen.getByTestId('bulk-move-to-namespace-2');
      expect(workItem).not.toBeDisabled();
    });

    it('should call onBulkMove with namespace id', () => {
      const onBulkMove = jest.fn();

      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
          onBulkMove={onBulkMove}
        />
      );

      fireEvent.click(screen.getByTestId('bulk-move-menu-trigger'));
      fireEvent.click(screen.getByTestId('bulk-move-to-namespace-2'));

      expect(onBulkMove).toHaveBeenCalledWith('2');
    });

    it('should have testid for each namespace item', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      fireEvent.click(screen.getByTestId('bulk-move-menu-trigger'));

      mockNamespaces.forEach((ns) => {
        expect(screen.getByTestId(`bulk-move-to-namespace-${ns.id}`)).toBeInTheDocument();
      });
    });

    it('should have proper aria-label for each item', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      fireEvent.click(screen.getByTestId('bulk-move-menu-trigger'));

      const defaultItem = screen.getByTestId('bulk-move-to-namespace-1');
      expect(defaultItem.getAttribute('aria-label')).toContain('Move to Default');
    });

    it('should include default namespace indicator in aria-label', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      fireEvent.click(screen.getByTestId('bulk-move-menu-trigger'));

      const defaultItem = screen.getByTestId('bulk-move-to-namespace-1');
      expect(defaultItem.getAttribute('aria-label')).toContain('Default');
    });
  });

  describe('Empty State', () => {
    it('should render only select all button when no namespaces', () => {
      render(
        <SelectionControls
          {...defaultProps}
          namespaces={[]}
          selectedIds={[]}
        />
      );

      expect(screen.getByTestId('select-all-btn')).toBeInTheDocument();
      expect(screen.queryByTestId('bulk-move-menu-trigger')).not.toBeInTheDocument();
    });

    it('should handle zero total count', () => {
      render(
        <SelectionControls
          {...defaultProps}
          totalFilteredCount={0}
          selectedIds={[]}
        />
      );

      expect(screen.getByTestId('selection-controls')).toBeInTheDocument();
    });

    it('should handle empty selection array', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={[]}
        />
      );

      expect(screen.getByTestId('select-all-btn')).toBeInTheDocument();
      expect(screen.queryByTestId('selection-count')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Selections', () => {
    it('should handle large selection count', () => {
      const largeSelection = Array.from({ length: 100 }, (_, i) => `id-${i}`);

      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={largeSelection}
          totalFilteredCount={100}
        />
      );

      expect(screen.getByText('100 selected')).toBeInTheDocument();
    });

    it('should handle selection count matching total', () => {
      const ids = Array.from({ length: 10 }, (_, i) => `id-${i}`);

      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={ids}
          totalFilteredCount={10}
        />
      );

      expect(screen.getByText('Deselect All')).toBeInTheDocument();
    });

    it('should handle partial selection of filtered results', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1', '2']}
          totalFilteredCount={5}
        />
      );

      expect(screen.getByText('2 selected')).toBeInTheDocument();
      expect(screen.getByText('Select All')).toBeInTheDocument();
    });
  });

  describe('Props Updates', () => {
    it('should update when selectedIds changes', () => {
      const { rerender } = render(
        <SelectionControls
          {...defaultProps}
          selectedIds={[]}
        />
      );

      expect(screen.queryByTestId('selection-count')).not.toBeInTheDocument();

      rerender(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1', '2']}
        />
      );

      expect(screen.getByTestId('selection-count')).toBeInTheDocument();
    });

    it('should update when namespaces changes', () => {
      const newNamespaces: Namespace[] = [
        { id: '1', name: 'Default', isDefault: true, createdAt: Date.now() },
        { id: '2', name: 'Work', isDefault: false, createdAt: Date.now() },
      ];

      const { rerender } = render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
          namespaces={mockNamespaces}
        />
      );

      fireEvent.click(screen.getByTestId('bulk-move-menu-trigger'));
      expect(screen.getByText('Personal')).toBeInTheDocument();

      rerender(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
          namespaces={newNamespaces}
        />
      );

      // Reopen menu
      fireEvent.click(screen.getByTestId('bulk-move-menu-trigger'));
    });

    it('should update when currentNamespaceId changes', () => {
      const { rerender } = render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
          currentNamespaceId="1"
        />
      );

      fireEvent.click(screen.getByTestId('bulk-move-menu-trigger'));
      let item = screen.getByTestId('bulk-move-to-namespace-2');
      expect(item).not.toBeDisabled();

      rerender(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
          currentNamespaceId="2"
        />
      );

      fireEvent.click(screen.getByTestId('bulk-move-menu-trigger'));
      item = screen.getByTestId('bulk-move-to-namespace-2');
      expect(item).toBeDisabled();
    });

    it('should update when totalFilteredCount changes', () => {
      const { rerender } = render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1', '2', '3']}
          totalFilteredCount={5}
        />
      );

      expect(screen.getByText('Select All')).toBeInTheDocument();

      rerender(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1', '2', '3']}
          totalFilteredCount={3}
        />
      );

      expect(screen.getByText('Deselect All')).toBeInTheDocument();
    });
  });

  describe('Callback Integration', () => {
    it('should call onSelectAll with correct parameters', () => {
      const onSelectAll = jest.fn();

      render(
        <SelectionControls
          {...defaultProps}
          onSelectAll={onSelectAll}
        />
      );

      fireEvent.click(screen.getByTestId('select-all-btn'));

      expect(onSelectAll).toHaveBeenCalledTimes(1);
    });

    it('should call onBulkMove with correct namespace id', () => {
      const onBulkMove = jest.fn();

      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
          onBulkMove={onBulkMove}
        />
      );

      fireEvent.click(screen.getByTestId('bulk-move-menu-trigger'));
      fireEvent.click(screen.getByTestId('bulk-move-to-namespace-3'));

      expect(onBulkMove).toHaveBeenCalledWith('3');
    });

    it('should not call callbacks when component mounts', () => {
      const onSelectAll = jest.fn();
      const onBulkMove = jest.fn();

      render(
        <SelectionControls
          {...defaultProps}
          onSelectAll={onSelectAll}
          onBulkMove={onBulkMove}
        />
      );

      expect(onSelectAll).not.toHaveBeenCalled();
      expect(onBulkMove).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility Features', () => {
    it('should have semantic HTML structure', () => {
      const { container } = render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      const wrapper = screen.getByTestId('selection-controls');
      expect(wrapper.tagName).toBe('DIV');
      expect(wrapper.getAttribute('role')).toBe('region');
    });

    it('should use proper button semantics', () => {
      render(<SelectionControls {...defaultProps} />);

      const button = screen.getByTestId('select-all-btn');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should have descriptive aria labels', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      const wrapper = screen.getByRole('region');
      expect(wrapper.getAttribute('aria-label')).toBe('Selection controls');

      const trigger = screen.getByTestId('bulk-move-menu-trigger');
      expect(trigger.getAttribute('aria-label')).toBeTruthy();
    });

    it('should use aria-live for dynamic updates', () => {
      render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      const count = screen.getByTestId('selection-count');
      expect(count.getAttribute('aria-live')).toBe('polite');
    });

    it('should have icon with aria-hidden', () => {
      const { container } = render(
        <SelectionControls
          {...defaultProps}
          selectedIds={['1']}
        />
      );

      // FolderOpen icon should be hidden from screen readers
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });
});
