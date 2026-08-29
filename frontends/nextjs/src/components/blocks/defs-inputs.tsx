'use client'
/** Inputs blocks. See block-defs for how these are assembled. */

import type { BlockDef } from './block-types'
import {
  Checkbox,
  Switch,
  TextField,
} from '@/m3'
import {
  propText,
} from './block-coerce'
import {
  m,
  renderButton,
} from './defs-shared'

export const INPUTS_DEFS: BlockDef[] = [
  {
    meta: m('button', 'Button', 'smart_button', 'Inputs', false, {
      label: 'Click me',
    }),
    render: renderButton,
  },
  {
    meta: m('m3.textfield', 'Text field', 'edit', 'Inputs', false, {
      label: 'Label',
      placeholder: '',
    }),
    render: p => (
      <TextField
        size="small"
        label={propText(p.label, 'Label')}
        placeholder={propText(p.placeholder)}
      />
    ),
  },
  {
    meta: m('m3.checkbox', 'Checkbox', 'check_box', 'Inputs', false, {
      label: 'Checkbox',
    }),
    render: p => (
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Checkbox />
        {propText(p.label, 'Checkbox')}
      </label>
    ),
  },
  {
    meta: m('m3.switch', 'Switch', 'toggle_on', 'Inputs', false, {
      label: 'Switch',
    }),
    render: p => (
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Switch />
        {propText(p.label, 'Switch')}
      </label>
    ),
  },
]
