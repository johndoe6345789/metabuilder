/**
 * Lua Packages
 *
 * Demonstrates Lua UI packages loaded from the main frontend
 */

import type { Meta, StoryObj } from '@storybook/react'

// Import Lua loader from main frontend
import { loadLuaUIPackage } from '../../../frontends/nextjs/src/lib/lua/ui/load-lua-ui-package'

const meta: Meta = {
  title: 'Lua Packages',
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj

/**
 * Simple demo showing the Lua loader is accessible
 */
export const LoaderDemo: Story = {
  render: () => (
    <div className="card">
      <h3>Lua Package Loader</h3>
      <p>The loadLuaUIPackage function is imported from the main frontend.</p>
      <code>loadLuaUIPackage: {typeof loadLuaUIPackage}</code>
    </div>
  ),
}
