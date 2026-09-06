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
  /**
   * `links` is a repeating list of label/destination pairs. It stores as one
   * delimited line (see parseNavLinks) because the schema has no repeating
   * type, but nobody should have to type that line -- the editor renders a
   * row per link.
   */
  type: 'text' | 'number' | 'boolean' | 'select' | 'links'
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
  /**
   * Surfaces a plain-language accessibility nudge right on this field,
   * instead of asking the author to already know what to check. Shown when
   * the field is empty and `when` says the rest of the block's properties
   * make that a real gap rather than a normal default -- an unset image has
   * no description to miss, one with a picture but no description does.
   */
  warnIfEmpty?: {
    when: (props: Record<string, unknown>) => boolean
    message: string
  }
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
    text('title', 'Summary', {
      placeholder: 'Details',
      hint: 'The line shown when it is closed',
    }),
  ],

  // ---- content ---------------------------------------------------------
  heading: [text('text', 'Heading text', { placeholder: 'Heading' })],
  text: [text('text', 'Text', { placeholder: 'Some text' })],
  'html.span': [text('text', 'Text', { placeholder: 'Some words' })],
  'html.p': [text('text', 'Text', { placeholder: 'Paragraph text.' })],
  'html.h1': [text('text', 'Heading text', { placeholder: 'Heading 1' })],
  'html.h2': [text('text', 'Heading text', { placeholder: 'Heading 2' })],
  'html.h3': [text('text', 'Heading text', { placeholder: 'Heading 3' })],
  'html.li': [text('text', 'Text', { placeholder: 'Item' })],
  'html.a': [
    text('text', 'Link text', { placeholder: 'Link' }),
    text('href', 'Goes to', {
      placeholder: '/contact',
      hint: 'A page path or full web address',
    }),
  ],
  image: [
    text('src', 'Image address', { placeholder: 'https://…/photo.jpg' }),
    text('alt', 'Description', {
      hint: 'Read aloud to people who cannot see the image. Leave empty only if it is decorative.',
      warnIfEmpty: {
        when: props =>
          typeof props.src === 'string' && props.src.trim() !== '',
        message:
          'This image has no description, so screen readers will skip it. Add one, or leave it blank on purpose if the image is purely decorative.',
      },
    }),
    num('radius', 'Rounded corners', { hint: 'Pixels' }),
  ],
  avatar: [
    text('initials', 'Initials', {
      placeholder: 'AB',
      hint: 'Shown when there is no picture',
    }),
    text('src', 'Picture address', { placeholder: 'https://…/face.jpg' }),
    pick(
      'size',
      'Size',
      [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
        // The block has always rendered xl; only the picker omitted it.
        { label: 'Extra large', value: 'xl' },
      ],
      { source: 'avatar-size' }
    ),
  ],
  stat: [
    text('label', 'Caption', { placeholder: 'Members' }),
    text('value', 'Figure', { placeholder: '1,204' }),
  ],
  'list-item': [
    text('icon', 'Icon', {
      placeholder: 'notifications',
      hint: 'A Material Symbols name',
      source: 'icons',
    }),
    text('title', 'Title', { placeholder: 'Title' }),
    text('description', 'Description', { placeholder: 'Description' }),
  ],
  'm3.chip': [text('label', 'Label', { placeholder: 'Chip' })],
  'm3.badge': [num('count', 'Number shown')],

  // ---- inputs ----------------------------------------------------------
  button: [
    text('label', 'Button text', { placeholder: 'Click me' }),
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
    text('action', 'Runs a workflow, recorded as', {
      placeholder: 'book-a-repair',
      hint:
        'Clicking records this, which runs whichever workflow is set to ' +
        'run when a form is submitted. Leave empty for a button that ' +
        'only navigates. Ignored inside a Form -- the Form records it',
    }),
    text('doneLabel', 'Says this once clicked', {
      placeholder: 'Thanks -- that is with us.',
    }),
    // Was labelled "Run the workflow when clicked", which is not what it
    // does: it runs the God Panel's unsaved draft in this browser through
    // a mock runner and shows an alert. On a published page there is no
    // draft, so a visitor got "No workflow wired yet." Renamed rather than
    // removed -- pages already set it, and hiding a prop that still works
    // is how it came to be misleading in the first place.
    bool('runWorkflow', 'Try the draft here instead (preview only)'),
  ],
  form: [
    text('formName', 'What this form is for', {
      placeholder: 'book-a-repair',
      hint:
        'The name the answers arrive under, and what a workflow watches ' +
        'for. Lower case, hyphens instead of spaces',
    }),
    text('successMessage', 'Shown after it is sent', {
      placeholder: 'Thanks -- we will be in touch.',
    }),
  ],
  'm3.textfield': [
    text('label', 'Label', { placeholder: 'Email address' }),
    text('name', 'Answer name', {
      placeholder: 'name',
      hint:
        'What this answer is called when it reaches a workflow, as ' +
        '${event.data.name}. Leave empty and the answer is not collected',
    }),
    text('placeholder', 'Hint inside the box', {
      placeholder: 'you@example.com',
      hint: 'Grey example text, shown until someone types',
    }),
  ],
  'm3.checkbox': [text('label', 'Label', { placeholder: 'Checkbox' })],
  'm3.switch': [text('label', 'Label', { placeholder: 'Switch' })],

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
    text('text', 'Message', { placeholder: 'Something worth knowing.' }),
  ],
  'm3.progress': [num('value', 'Percent complete', { hint: '0 to 100' })],
  'm3.skeleton': [num('height', 'Height', { hint: 'Pixels' })],
  'm3.tooltip': [
    text('title', 'Tooltip text', {
      placeholder: 'Explanation',
      hint: 'Shown when someone hovers the contents',
    }),
  ],

  // ---- navigation --------------------------------------------------------
  'nav.header': [
    text('brand', 'Site name', { placeholder: 'Your community' }),
    {
      name: 'links',
      label: 'Links',
      type: 'links',
      hint: 'Collapses into a burger menu on narrow screens',
    },
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
