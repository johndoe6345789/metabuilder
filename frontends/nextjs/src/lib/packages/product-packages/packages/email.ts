import type { ProductPackage } from '../types'

export const EMAIL_PACKAGE: ProductPackage = {
  id: 'email',
  name: 'Email',
  tagline: 'Newsletters and notifications',
  icon: 'mail',
  color: '#6B44B2',
  features: [
    'Email newsletters to your members',
    'Welcome and onboarding emails',
    'Customisable notification templates',
    'SMTP or managed delivery',
  ],
  defaultRoutes: [{ path: '/newsletters', title: 'Newsletters' }],
  category: 'comms',
}
