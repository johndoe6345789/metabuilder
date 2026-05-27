'use client';

import React from 'react';
import type { ComponentNode } from './featureConfig';
import type { RenderContext } from './componentTreeHelpers';
import {
  ComponentTreeRenderer,
} from './componentTreeRenderer';

/**
 * Hook for managing a component tree with local state.
 */
export function useComponentTree(
  tree: ComponentNode,
  initialData?: Record<string, any>,
  actions?: Record<string, (...args: any[]) => any>,
) {
  const [data, setData] = React.useState(initialData || {});
  const [state, setState] = React.useState<Record<string, any>>({});

  const context: RenderContext = React.useMemo(
    () => ({ data, actions, state }),
    [data, actions, state],
  );

  const updateData = React.useCallback(
    (newData: Record<string, any>) => {
      setData(prev => ({ ...prev, ...newData }));
    },
    [],
  );

  const updateState = React.useCallback(
    (newState: Record<string, any>) => {
      setState(prev => ({ ...prev, ...newState }));
    },
    [],
  );

  return {
    render: () => (
      <ComponentTreeRenderer tree={tree} context={context} />
    ),
    data,
    state,
    updateData,
    updateState,
  };
}
