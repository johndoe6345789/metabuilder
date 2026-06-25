'use client';

import React from 'react';
import type { ComponentNode } from './featureConfig';
import type { RenderContext } from './componentTreeHelpers';
import { evaluateCondition, getNestedValue } from './componentTreeHelpers';
import { processProps } from './componentPropsProcessor';
import { componentRegistry, resolveIcon } from './componentRegistry';

export type { RenderContext };
export { useComponentTree } from './useComponentTree';

export function renderComponentNode(
  node: ComponentNode,
  context: RenderContext,
  key?: string | number,
): React.ReactElement | null {
  if (node.condition && !evaluateCondition(node.condition, context)) {
    return null;
  }
  if (node.forEach) {
    const dataArray = getNestedValue(context, node.forEach);
    if (!Array.isArray(dataArray)) {
      console.warn(`forEach data is not an array: ${node.forEach}`);
      return null;
    }
    return (
      <React.Fragment key={key}>
        {dataArray.map((item, index) => {
          const ctx: RenderContext = {
            ...context, data: { ...context.data, item, index },
          };
          const { forEach: _f, ...itemNode } = node;
          return renderComponentNode(
            itemNode as ComponentNode, ctx, `${key}-${index}`,
          );
        })}
      </React.Fragment>
    );
  }
  const props = processProps(node.props, context);
  if (node.component === 'Icon' && props.name) {
    return resolveIcon(props.name, { ...props, key });
  }
  const Component = componentRegistry[node.component];
  if (!Component) {
    console.warn(`Component not found in registry: ${node.component}`);
    return null;
  }
  let children: React.ReactNode = null;
  if (props.text) { children = props.text; delete props.text; }
  if (node.children?.length) {
    children = node.children.map((child, i) =>
      renderComponentNode(child, context, `${key}-child-${i}`),
    );
  }
  return React.createElement(Component, { ...props, key }, children);
}

export function ComponentTreeRenderer({
  tree, context,
}: {
  tree: ComponentNode;
  context: RenderContext;
}): React.ReactElement | null {
  return renderComponentNode(tree, context, 'root');
}

export default function ComponentTreeRendererDefault({
  tree, data = {}, handlers = {},
}: {
  tree: ComponentNode;
  data?: Record<string, any>;
  handlers?: Record<string, (...args: any[]) => void>;
}): React.ReactElement | null {
  return renderComponentNode(
    tree, { data, handlers, actions: handlers }, 'root',
  );
}
