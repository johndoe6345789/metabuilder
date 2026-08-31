/** JSON component type names that don't already match an HTML tag. */
const ELEMENT_TYPE_MAP: Record<string, string> = {
  Box: 'div',
  Stack: 'div',
  Text: 'span',
  Button: 'button',
  Link: 'a',
  List: 'ul',
  ListItem: 'li',
  Icon: 'span',
  Avatar: 'div',
  Badge: 'div',
  Divider: 'hr',
  Breadcrumbs: 'nav',
}

/** Maps a JSON component type to the HTML tag it renders as, falling
 *  through to the type itself for anything unmapped. */
export function getElementType(type: string): string {
  return ELEMENT_TYPE_MAP[type] ?? type
}
