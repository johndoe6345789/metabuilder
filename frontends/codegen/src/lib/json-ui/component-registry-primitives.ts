/**
 * Primitive HTML element and M3 component registry entries.
 */
import React, { ComponentType } from 'react'
import type { UIComponentRegistry } from './component-registry-types'

import { Stack } from '@metabuilder/m3/layout'
import { Flex } from '@metabuilder/m3/layout'
import { Grid } from '@metabuilder/m3/layout'
import { Heading } from '@metabuilder/m3/atoms'
import { Text } from '@metabuilder/m3/atoms'
import { Section } from '@metabuilder/m3/atoms'
import { Separator } from '@metabuilder/m3/data-display'
import { Badge } from '@metabuilder/m3/data-display'
import { Chip } from '@metabuilder/m3/data-display'
import { Avatar } from '@metabuilder/m3/data-display'
import { AvatarGroup } from '@metabuilder/m3/data-display'
import { ButtonGroup } from '@metabuilder/m3/inputs'
import { IconButton } from '@metabuilder/m3/inputs'
import { Card } from '@metabuilder/m3/surfaces'
import { Alert, AlertDescription } from '@metabuilder/m3/feedback'
import { Link } from '@metabuilder/m3/navigation'

// Primitive HTML elements mapped to string literals.
// React accepts strings as valid element types at runtime; `as any` satisfies
// the ComponentType<any> type without wrapping in a function component.
export const primitiveComponents: UIComponentRegistry = {
  div: 'div' as any,
  span: 'span' as any,
  p: 'p' as any,
  option: 'option' as any,
  optgroup: 'optgroup' as any,
  h1: 'h1' as any,
  h2: 'h2' as any,
  h3: 'h3' as any,
  h4: 'h4' as any,
  h5: 'h5' as any,
  h6: 'h6' as any,
  section: 'section' as any,
  article: 'article' as any,
  header: 'header' as any,
  footer: 'footer' as any,
  main: 'main' as any,
  aside: 'aside' as any,
  nav: 'nav' as any,
  button: 'button' as any,
  input: 'input' as any,
  select: 'select' as any,
  textarea: 'textarea' as any,
  form: 'form' as any,
  label: 'label' as any,
  a: 'a' as any,
  img: 'img' as any,
  list: 'div' as any,
  text: 'span' as any,
  strong: 'strong' as any,
  em: 'em' as any,
  b: 'b' as any,
  i: 'i' as any,
  br: 'br' as any,
  small: 'small' as any,
  code: 'code' as any,
  pre: 'pre' as any,
  hr: 'hr' as any,
  ul: 'ul' as any,
  ol: 'ol' as any,
  li: 'li' as any,
  table: 'table' as any,
  thead: 'thead' as any,
  tbody: 'tbody' as any,
  tr: 'tr' as any,
  th: 'th' as any,
  td: 'td' as any,
}

// M3 primitives — registered explicitly to prevent collisions
// with icon names (e.g. "Stack" icon = createMaterialIcon('layers'))
// and to break circular JSON stub definitions.
export const m3Components: UIComponentRegistry = {
  Paragraph: 'p' as unknown as ComponentType<any>,
  Div: 'div' as unknown as ComponentType<any>,
  Stack: Stack as unknown as ComponentType<any>,
  Flex: Flex as unknown as ComponentType<any>,
  Grid: Grid as unknown as ComponentType<any>,
  Heading: Heading as unknown as ComponentType<any>,
  Text: Text as unknown as ComponentType<any>,
  Section: Section as unknown as ComponentType<any>,
  Separator: Separator as unknown as ComponentType<any>,
  Badge: Badge as unknown as ComponentType<any>,
  Chip: Chip as unknown as ComponentType<any>,
  Avatar: Avatar as unknown as ComponentType<any>,
  AvatarGroup: AvatarGroup as unknown as ComponentType<any>,
  ButtonGroup: ButtonGroup as unknown as ComponentType<any>,
  IconButton: IconButton as unknown as ComponentType<any>,
  Card: Card as unknown as ComponentType<any>,
  Alert: Alert as unknown as ComponentType<any>,
  AlertDescription: AlertDescription as unknown as ComponentType<any>,
  Link: Link as unknown as ComponentType<any>,
}
