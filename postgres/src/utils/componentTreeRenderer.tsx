/**
 * Unified Component Tree Renderer
 * Dynamically renders React component trees from JSON configuration
 * Merges both previous implementations for maximum compatibility
 */

'use client';

import React from 'react';
import type { ComponentNode } from './featureConfig';

// Import all atomic components
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
} from '@mui/material';

// Import Material Icons
import * as Icons from '@mui/icons-material';

// Component registry - maps component names to actual components
const componentRegistry: Record<string, React.ComponentType<any>> = {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
};

type RenderContext = {
  data?: Record<string, any>;
  actions?: Record<string, (...args: any[]) => any>;
  handlers?: Record<string, (...args: any[]) => any>; // Alias for backward compatibility
  state?: Record<string, any>;
};

/**
 * Interpolate template strings like {{variable}} with actual values
 */
function interpolateValue(value: any, context: RenderContext): any {
  if (typeof value !== 'string') {
    return value;
  }

  // Check if it's a template string
  const templateMatch = value.match(/^{{(.+)}}$/);
  if (templateMatch && templateMatch[1]) {
    const path = templateMatch[1].trim();
    return getNestedValue(context, path);
  }

  // Replace inline templates
  return value.replace(/{{(.+?)}}/g, (_, path) => {
    const val = getNestedValue(context, path.trim());
    return val !== undefined ? String(val) : '';
  });
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    // Handle array access like array[0]
    const arrayMatch = key.match(/(.+)\[(\d+)\]/);
    if (arrayMatch && arrayMatch[1] && arrayMatch[2]) {
      const arrayKey = arrayMatch[1];
      const index = arrayMatch[2];
      return current?.[arrayKey]?.[Number.parseInt(index, 10)];
    }
    return current?.[key];
  }, obj);
}

/**
 * Evaluate condition expressions
 */
function evaluateCondition(condition: string, context: RenderContext): boolean {
  try {
    // Simple condition evaluation - can be extended
    const value = getNestedValue(context, condition);
    
    // Handle boolean checks
    if (typeof value === 'boolean') {
      return value;
    }
    
    // Handle truthy checks
    return Boolean(value);
  } catch {
    return false;
  }
}

/**
 * Process props and replace template variables
 */
function processProps(props: Record<string, any> = {}, context: RenderContext): Record<string, any> {
  const processed: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    // Handle special props
    if (key === 'onClick' || key === 'onChange' || key === 'onClose' || key === 'onBlur' || key === 'onFocus') {
      // Map to action functions - check both actions and handlers for backward compatibility
      if (typeof value === 'string') {
        processed[key] = context.actions?.[value] || context.handlers?.[value];
      } else {
        processed[key] = value;
      }
    } else if (key === 'startIcon' || key === 'endIcon' || key === 'icon') {
      // Handle icon props
      if (typeof value === 'string') {
        const iconValue = interpolateValue(value, context);
        const IconComponent = (Icons as any)[iconValue];
        if (IconComponent) {
          processed[key] = React.createElement(IconComponent);
        }
      }
    } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      // Recursively process nested objects
      processed[key] = processProps(value, context);
    } else {
      // Interpolate template strings
      processed[key] = interpolateValue(value, context);
    }
  }

  return processed;
}

/**
 * Render Icon component
 */
function renderIcon(iconName: string, props?: Record<string, any>): React.ReactElement | null {
  const IconComponent = (Icons as any)[iconName];
  if (!IconComponent) {
    return null;
  }
  return React.createElement(IconComponent, props);
}

/**
 * Render a single component node
 */
export function renderComponentNode(
  node: ComponentNode,
  context: RenderContext,
  key?: string | number,
): React.ReactElement | null {
  // Check condition if present
  if (node.condition && !evaluateCondition(node.condition, context)) {
    return null;
  }

  // Handle forEach loops
  if (node.forEach) {
    const dataArray = getNestedValue(context, node.forEach);
    if (!Array.isArray(dataArray)) {
      console.warn(`forEach data is not an array: ${node.forEach}`);
      return null;
    }

    return (
      <React.Fragment key={key}>
        {dataArray.map((item, index) => {
          // Create context for this iteration
          const itemContext: RenderContext = {
            ...context,
            data: {
              ...context.data,
              item,
              index,
            },
          };

          // Render children with item context
          if (node.children) {
            return node.children.map((child, childIndex) => 
              renderComponentNode(child, itemContext, `${key}-${index}-${childIndex}`)
            );
          }

          return null;
        })}
      </React.Fragment>
    );
  }

  // Get component from registry
  const Component = componentRegistry[node.component];
  if (!Component) {
    console.warn(`Component not found in registry: ${node.component}`);
    return null;
  }

  // Process props
  const props = processProps(node.props, context);

  // Handle special text prop for Typography and similar components
  let children: React.ReactNode = null;
  if (props.text) {
    children = props.text;
    delete props.text;
  }

  // Render children
  if (node.children && node.children.length > 0) {
    children = node.children.map((child, index) => 
      renderComponentNode(child, context, `${key}-child-${index}`)
    );
  }

  // Handle Icon component specially
  if (node.component === 'Icon' && props.name) {
    return renderIcon(props.name, { ...props, key });
  }

  return React.createElement(Component, { ...props, key }, children);
}

/**
 * Main component tree renderer (named export)
 */
export function ComponentTreeRenderer({
  tree,
  context,
}: {
  tree: ComponentNode;
  context: RenderContext;
}): React.ReactElement | null {
  return renderComponentNode(tree, context, 'root');
}

/**
 * Default export for backward compatibility with old imports
 */
export default function ComponentTreeRendererDefault({
  tree,
  data = {},
  handlers = {},
}: {
  tree: ComponentNode;
  data?: Record<string, any>;
  handlers?: Record<string, (...args: any[]) => void>;
}): React.ReactElement | null {
  const context: RenderContext = {
    data,
    handlers,
    actions: handlers, // Map handlers to actions for compatibility
  };
  
  return renderComponentNode(tree, context, 'root');
}

/**
 * Hook to use component tree with state management
 */
export function useComponentTree(
  tree: ComponentNode,
  initialData?: Record<string, any>,
  actions?: Record<string, (...args: any[]) => any>,
) {
  const [data, setData] = React.useState(initialData || {});
  const [state, setState] = React.useState<Record<string, any>>({});

  const context: RenderContext = React.useMemo(
    () => ({
      data,
      actions,
      state,
    }),
    [data, actions, state],
  );

  const updateData = React.useCallback((newData: Record<string, any>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const updateState = React.useCallback((newState: Record<string, any>) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  return {
    render: () => <ComponentTreeRenderer tree={tree} context={context} />,
    data,
    state,
    updateData,
    updateState,
  };
}
