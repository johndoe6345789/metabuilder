'use client'
/** Inputs blocks. See block-defs for how these are assembled. */

import type { BlockDef } from './block-types'
import {
  Checkbox,
  Switch,
} from '@/m3'
import {
  propText,
} from './block-coerce'
import {
  m,
  renderButton,
} from './defs-shared'
import { FormTextField } from './form/FormTextField'
import { FormBlock } from './form/FormBlock'

export const INPUTS_DEFS: BlockDef[] = [
  {
    // A container: the fields go inside it, and submitting writes one
    // FormSubmission row -- which is what makes DBAL run the tenant's
    // published workflow. See form/submit-form.ts.
    meta: m('form', 'Form', 'assignment', 'Inputs', true, {
      formName: 'enquiry',
      successMessage: 'Thanks -- we have got that and will be in touch.',
    }),
    render: (p, children) => (
      <FormBlock
        formName={propText(p.formName, 'enquiry')}
        successMessage={propText(
          p.successMessage,
          'Thanks -- we have got that.'
        )}
      >
        {children}
      </FormBlock>
    ),
  },
  {
    meta: m('button', 'Button', 'smart_button', 'Inputs', false, {}),
    render: renderButton,
  },
  {
    // `name` is what the answer is called when it reaches the workflow, as
    // ${event.data.<name>}. Without it the field is decoration: it renders,
    // someone types into it, and nothing carries what they typed.
    meta: m('m3.textfield', 'Text field', 'edit', 'Inputs', false, {
      placeholder: '',
      name: '',
    }),
    render: p => <FormTextField p={p} />,
  },
  {
    meta: m('m3.checkbox', 'Checkbox', 'check_box', 'Inputs', false, {}),
    render: p => (
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Checkbox />
        {propText(p.label, 'Checkbox')}
      </label>
    ),
  },
  {
    meta: m('m3.switch', 'Switch', 'toggle_on', 'Inputs', false, {}),
    render: p => (
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Switch />
        {propText(p.label, 'Switch')}
      </label>
    ),
  },
]
