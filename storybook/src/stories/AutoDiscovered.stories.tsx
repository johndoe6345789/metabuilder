/**
 * Auto-Discovered Packages
 */

import type { Meta, StoryObj } from '@storybook/react'
import packageIndex from '../../../packages/index.json'

const packageIds = packageIndex.packages.map(pkg => pkg.packageId)

const meta: Meta = {
  title: 'Packages',
}

export default meta

export const ClassDemo: StoryObj<{ packageId: string; className: string }> = {
  args: { packageId: packageIds[0], className: 'button' },
  argTypes: {
    packageId: { control: 'select', options: packageIds },
    className: { control: 'select', options: ['button', 'card', 'table', 'input'] },
  },
  render: ({ packageId, className }) => (
    <div className="card">
      <code>className="{className} {packageId}_{className}"</code>
    </div>
  ),
}
