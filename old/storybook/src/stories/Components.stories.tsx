import type { Meta, StoryObj } from '@storybook/react'

import * as Components from '../components/registry'

/**
 * Component Registry showcases all available components
 * that can be used in MetaBuilder packages.
 */
const meta: Meta = {
  title: 'Components/Registry',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

/**
 * Box is the basic building block for layouts
 */
export const Box: Story = {
  render: () => (
    <Components.Box className="p-4 border rounded">
      Box content
    </Components.Box>
  ),
}

/**
 * Stack arranges children vertically
 */
export const Stack: Story = {
  render: () => (
    <Components.Stack>
      <Components.Box className="p-2 border">Item 1</Components.Box>
      <Components.Box className="p-2 border">Item 2</Components.Box>
      <Components.Box className="p-2 border">Item 3</Components.Box>
    </Components.Stack>
  ),
}

/**
 * Flex arranges children horizontally
 */
export const Flex: Story = {
  render: () => (
    <Components.Flex>
      <Components.Box className="p-2 border">Item 1</Components.Box>
      <Components.Box className="p-2 border">Item 2</Components.Box>
      <Components.Box className="p-2 border">Item 3</Components.Box>
    </Components.Flex>
  ),
}

/**
 * Grid creates a responsive grid layout
 */
export const Grid: Story = {
  render: () => (
    <Components.Grid className="grid grid-cols-3 gap-4">
      <Components.Box className="p-4 border rounded">1</Components.Box>
      <Components.Box className="p-4 border rounded">2</Components.Box>
      <Components.Box className="p-4 border rounded">3</Components.Box>
      <Components.Box className="p-4 border rounded">4</Components.Box>
      <Components.Box className="p-4 border rounded">5</Components.Box>
      <Components.Box className="p-4 border rounded">6</Components.Box>
    </Components.Grid>
  ),
}

/**
 * Card with header, content, and actions
 */
export const Card: Story = {
  render: () => (
    <Components.Card>
      <Components.CardHeader>
        <Components.Typography variant="h5">Card Title</Components.Typography>
      </Components.CardHeader>
      <Components.CardContent>
        <Components.Typography>
          This is the card content. Cards are used to group related information.
        </Components.Typography>
      </Components.CardContent>
      <Components.CardActions>
        <Components.Button variant="text">Cancel</Components.Button>
        <Components.Button variant="contained">Submit</Components.Button>
      </Components.CardActions>
    </Components.Card>
  ),
}

/**
 * Typography variants for text styling
 */
export const Typography: Story = {
  render: () => (
    <Components.Stack>
      <Components.Typography variant="h1">Heading 1</Components.Typography>
      <Components.Typography variant="h2">Heading 2</Components.Typography>
      <Components.Typography variant="h3">Heading 3</Components.Typography>
      <Components.Typography variant="h4">Heading 4</Components.Typography>
      <Components.Typography variant="h5">Heading 5</Components.Typography>
      <Components.Typography variant="h6">Heading 6</Components.Typography>
      <Components.Typography variant="body1">Body 1 - Regular paragraph text</Components.Typography>
      <Components.Typography variant="body2">Body 2 - Smaller paragraph text</Components.Typography>
      <Components.Typography variant="caption">Caption - Small helper text</Components.Typography>
      <Components.Typography variant="overline">Overline - Category labels</Components.Typography>
    </Components.Stack>
  ),
}

/**
 * Button variants and sizes
 */
export const Buttons: Story = {
  render: () => (
    <Components.Stack>
      <Components.Flex>
        <Components.Button variant="contained">Contained</Components.Button>
        <Components.Button variant="outlined">Outlined</Components.Button>
        <Components.Button variant="text">Text</Components.Button>
      </Components.Flex>
      <Components.Flex>
        <Components.Button size="small">Small</Components.Button>
        <Components.Button size="medium">Medium</Components.Button>
        <Components.Button size="large">Large</Components.Button>
      </Components.Flex>
    </Components.Stack>
  ),
}

/**
 * Icons with different sizes
 */
export const Icons: Story = {
  render: () => (
    <Components.Flex className="flex gap-8 items-end">
      <Components.Stack>
        <Components.Icon name="users" size="small" />
        <Components.Typography variant="caption">Small</Components.Typography>
      </Components.Stack>
      <Components.Stack>
        <Components.Icon name="settings" size="medium" />
        <Components.Typography variant="caption">Medium</Components.Typography>
      </Components.Stack>
      <Components.Stack>
        <Components.Icon name="dashboard" size="large" />
        <Components.Typography variant="caption">Large</Components.Typography>
      </Components.Stack>
    </Components.Flex>
  ),
}

/**
 * Alert severity levels
 */
export const Alerts: Story = {
  render: () => (
    <Components.Stack>
      <Components.Alert severity="info">Info alert message</Components.Alert>
      <Components.Alert severity="success">Success alert message</Components.Alert>
      <Components.Alert severity="warning">Warning alert message</Components.Alert>
      <Components.Alert severity="error">Error alert message</Components.Alert>
    </Components.Stack>
  ),
}

/**
 * Badge and Chip components
 */
export const BadgesAndChips: Story = {
  render: () => (
    <Components.Flex className="flex gap-4 items-center">
      <Components.Badge>Default</Components.Badge>
      <Components.Chip label="Chip Label" />
      <Components.Chip label="Another Chip" />
    </Components.Flex>
  ),
}

/**
 * App layout components
 */
export const AppLayout: Story = {
  render: () => (
    <Components.Box className="border rounded overflow-hidden" style={{ height: '400px' }}>
      <Components.Level4Header username="demo_user" nerdMode={false} />
      <Components.Container className="py-8">
        <Components.IntroSection 
          eyebrow="Example"
          title="App Layout Demo"
          description="This shows the Level4Header and IntroSection components"
        />
      </Components.Container>
    </Components.Box>
  ),
}

/**
 * Tabs component
 */
export const TabsComponent: Story = {
  render: () => (
    <Components.Tabs 
      items={[
        { value: 'tab1', label: 'First Tab', content: <Components.Typography>First tab content</Components.Typography> },
        { value: 'tab2', label: 'Second Tab', content: <Components.Typography>Second tab content</Components.Typography> },
        { value: 'tab3', label: 'Third Tab', content: <Components.Typography>Third tab content</Components.Typography> },
      ]}
    />
  ),
}
