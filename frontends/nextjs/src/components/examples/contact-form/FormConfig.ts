export type ContactFormFieldType = 'text' | 'email' | 'textarea'

export interface ContactFormField {
  name: 'name' | 'email' | 'message'
  label: string
  placeholder: string
  type: ContactFormFieldType
  required?: boolean
  helperText?: string
}

export interface ContactFormConfig {
  title: string
  description: string
  submitLabel: string
  successTitle: string
  successMessage: string
  fields: ContactFormField[]
}

export const contactFormConfig: ContactFormConfig = {
  title: 'Contact form',
  description: 'Collect a name, email, and short message with simple validation.',
  submitLabel: 'Send message',
  successTitle: 'Message sent',
  successMessage: 'Thanks for reaching out. We will get back to you shortly.',
  fields: [
    {
      name: 'name',
      label: 'Name',
      placeholder: 'Your name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      placeholder: 'you@example.com',
      type: 'email',
      required: true,
      helperText: 'We will only use this to reply to your note.',
    },
    {
      name: 'message',
      label: 'Message',
      placeholder: 'How can we help?',
      type: 'textarea',
      required: true,
    },
  ],
}

export type ContactFormState = Record<ContactFormField['name'], string>

export function createInitialContactFormState(): ContactFormState {
  return contactFormConfig.fields.reduce<ContactFormState>((state, field) => {
    state[field.name] = ''
    return state
  }, {} as ContactFormState)
}
