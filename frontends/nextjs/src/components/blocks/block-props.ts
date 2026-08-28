'use client'

/**
 * What each block's properties are called, and how they should be edited.
 *
 * The builder previously inferred a block's editor from its `defaults`, which
 * gets the shape roughly right and everything else wrong: a prop with three
 * valid values renders as a free text box, every label is a de-camel-cased
 * key, and a prop the block reads but does not default -- a button's href,
 * its variant -- does not appear at all.
 *
 * Kept apart from block-registry so that file stays about rendering. A block
 * with no entry here still gets the inferred editor, so adding a block never
 * requires touching this file first.
 */

export interface PropField {
  name: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select'
  /** For `select`: the built-in choices. */
  options?: { label: string; value: string }[]
  /**
   * For `select`: the name of a Config-tab dropdown whose options replace the
   * built-in ones when a tenant has defined it. This is how an option list is
   * made tenant-specific without changing code.
   */
  source?: string
  hint?: string
  placeholder?: string
}

const text = (
  name: string,
  label: string,
  rest: Partial<PropField> = {}
): PropField => ({ name, label, type: 'text', ...rest })
const num = (
  name: string,
  label: string,
  rest: Partial<PropField> = {}
): PropField => ({ name, label, type: 'number', ...rest })
const bool = (
  name: string,
  label: string,
  rest: Partial<PropField> = {}
): PropField => ({ name, label, type: 'boolean', ...rest })
const pick = (
  name: string,
  label: string,
  options: { label: string; value: string }[],
  rest: Partial<PropField> = {}
): PropField => ({ name, label, type: 'select', options, ...rest })

export const PROP_SCHEMAS: Record<string, PropField[]> = {
  // ---- layout ----------------------------------------------------------
  container: [
    pick(
      'direction',
      'Stack items',
      [
        { label: 'Down the page', value: 'column' },
        { label: 'Across the page', value: 'row' },
      ],
      { source: 'container-direction' }
    ),
    num('gap', 'Space between items', { hint: 'Pixels' }),
  ],
  grid: [
    num('columns', 'Columns'),
    num('gap', 'Space between cells', { hint: 'Pixels' }),
  ],
  divider: [num('margin', 'Space above and below', { hint: 'Pixels' })],
  'html.div': [num('padding', 'Space inside', { hint: 'Pixels' })],
  'm3.paper': [num('padding', 'Space inside', { hint: 'Pixels' })],
  'm3.accordion': [
    text('title', 'Summary', { hint: 'The line shown when it is closed' }),
  ],

  // ---- content ---------------------------------------------------------
  heading: [text('text', 'Heading text')],
  text: [text('text', 'Text')],
  'html.span': [text('text', 'Text')],
  'html.p': [text('text', 'Text')],
  'html.h1': [text('text', 'Heading text')],
  'html.h2': [text('text', 'Heading text')],
  'html.h3': [text('text', 'Heading text')],
  'html.li': [text('text', 'Text')],
  'html.a': [
    text('text', 'Link text'),
    text('href', 'Goes to', {
      placeholder: '/contact',
      hint: 'A page path or full web address',
    }),
  ],
  image: [
    text('src', 'Image address', { placeholder: 'https://…/photo.jpg' }),
    text('alt', 'Description', {
      hint: 'Read aloud to people who cannot see the image. Leave empty only if it is decorative.',
    }),
    num('radius', 'Rounded corners', { hint: 'Pixels' }),
  ],
  avatar: [
    text('initials', 'Initials', { hint: 'Shown when there is no picture' }),
    text('src', 'Picture address', { placeholder: 'https://…/face.jpg' }),
    pick(
      'size',
      'Size',
      [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
      { source: 'avatar-size' }
    ),
  ],
  stat: [text('label', 'Caption'), text('value', 'Figure')],
  'list-item': [
    text('icon', 'Icon', {
      placeholder: 'notifications',
      hint: 'A Material Symbols name',
      source: 'icons',
    }),
    text('title', 'Title'),
    text('description', 'Description'),
  ],
  'm3.chip': [text('label', 'Label')],
  'm3.badge': [num('count', 'Number shown')],

  // ---- inputs ----------------------------------------------------------
  button: [
    text('label', 'Button text'),
    text('href', 'Goes to', {
      placeholder: '/contact',
      hint: 'Leave empty for a button that does not navigate',
    }),
    pick(
      'variant',
      'Style',
      [
        { label: 'Solid', value: 'contained' },
        { label: 'Outlined', value: 'outlined' },
        { label: 'Plain', value: 'text' },
      ],
      { source: 'button-variant' }
    ),
    bool('runWorkflow', 'Run the workflow when clicked'),
  ],
  'm3.textfield': [text('label', 'Label'), text('placeholder', 'Placeholder')],
  'm3.checkbox': [text('label', 'Label')],
  'm3.switch': [text('label', 'Label')],

  // ---- feedback --------------------------------------------------------
  'm3.alert': [
    pick(
      'severity',
      'Kind',
      [
        { label: 'Information', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ],
      { source: 'alert-severity' }
    ),
    text('text', 'Message'),
  ],
  'm3.progress': [num('value', 'Percent complete', { hint: '0 to 100' })],
  'm3.skeleton': [num('height', 'Height', { hint: 'Pixels' })],
  'm3.tooltip': [
    text('title', 'Tooltip text', {
      hint: 'Shown when someone hovers the contents',
    }),
  ],

  // ---- community -------------------------------------------------------
  'pkg.webchat': [
    text('channel', 'Channel', {
      placeholder: '#general',
      source: 'chat-channels',
    }),
  ],
}

export function propSchema(type: string): PropField[] | null {
  return PROP_SCHEMAS[type] ?? null
}
