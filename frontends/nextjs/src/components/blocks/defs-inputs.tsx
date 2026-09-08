'use client'
/** Inputs blocks. See block-defs for how these are assembled. */

import type { BlockDef } from './block-types'
import {
  propText,
} from './block-coerce'
import { m } from './defs-shared'
import { renderButton } from './BlockButton'
import { FormTextField } from './form/FormTextField'
import { FormBlock } from './form/FormBlock'
import { FormCheckbox } from './form/FormCheckbox'

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
    // `name` is what the answer is called when it reaches the workflow,
    // as ${event.data.<name>}; see FormCheckbox for why an unticked box is
    // recorded too.
    meta: m('m3.checkbox', 'Checkbox', 'check_box', 'Inputs', false, {
      name: '',
    }),
    render: p => <FormCheckbox p={p} control="checkbox" />,
  },
  {
    meta: m('m3.switch', 'Switch', 'toggle_on', 'Inputs', false, { name: '' }),
    render: p => <FormCheckbox p={p} control="switch" />,
  },
]
