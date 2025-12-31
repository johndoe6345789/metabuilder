/**
 * Auto-Discovered Packages
 *
 * Demonstrates package-prefixed styling from V2 schemas
 */

import type { Meta, StoryObj } from '@storybook/react'
import packageIndex from '../../../packages/index.json'

interface PackageClassDemoProps {
  packageId: string
  className: string
}

// Extract package IDs from the index
const packageIds = packageIndex.packages.map(pkg => pkg.packageId)

const meta: Meta = {
  title: 'Auto-Discovered Packages',
  parameters: {
    layout: 'centered',
  },
}

export default meta

/**
 * Package Class Demo - Shows how package prefixes work
 */
export const ClassDemo: StoryObj<PackageClassDemoProps> = {
  args: {
    packageId: 'ui_level3',
    className: 'button',
  },
  argTypes: {
    packageId: {
      control: 'select',
      options: packageIds,
    },
    className: {
      control: 'select',
      options: ['button', 'card', 'table', 'input', 'panel'],
    },
  },
  render: ({ packageId, className }) => (
    <div className="card">
      <h3>Package-Prefixed Class Example</h3>
      <p>
        Base class: <code>.{className}</code>
      </p>
      <p>
        Package-prefixed class: <code>.{packageId}_{className}</code>
      </p>
      <p>
        Combined usage: <code>className="{className} {packageId}_{className}"</code>
      </p>
    </div>
  ),
}
