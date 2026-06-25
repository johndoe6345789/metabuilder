/**
 * Processes raw JSON props from the component tree into React-ready
 * props, handling template interpolation and icon resolution.
 */

import React from 'react';
import type { RenderContext } from './componentTreeHelpers';
import { interpolateValue } from './componentTreeHelpers';
import { iconOverrides, resolveIcon } from './componentRegistry';
import * as Icons from '@metabuilder/components/m3';

const EVENT_PROPS = new Set([
  'onClick',
  'onChange',
  'onClose',
  'onBlur',
  'onFocus',
]);
const ICON_PROPS = new Set(['startIcon', 'endIcon', 'icon']);

export function processProps(
  props: Record<string, any> = {},
  context: RenderContext,
): Record<string, any> {
  const processed: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    if (EVENT_PROPS.has(key)) {
      if (typeof value === 'string') {
        processed[key]
          = context.actions?.[value] || context.handlers?.[value];
      } else {
        processed[key] = value;
      }
    } else if (ICON_PROPS.has(key)) {
      if (typeof value === 'string') {
        const iconName = interpolateValue(value, context) as string;
        const IconCmp
          = iconOverrides[iconName] || (Icons as any)[iconName];
        if (IconCmp) {
          processed[key] = React.createElement(IconCmp);
        }
      }
    } else if (
      typeof value === 'object'
      && !Array.isArray(value)
      && value !== null
    ) {
      processed[key] = processProps(value, context);
    } else {
      processed[key] = interpolateValue(value, context);
    }
  }

  return processed;
}
