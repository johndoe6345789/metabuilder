import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import { generateMeta, generateStories } from '@/utils/storybook/storyGenerator';

/**
 * Example of using story generator with features.json configuration
 * This demonstrates how to leverage the storybookStories section from features.json
 */

// Generate meta from features.json
const meta = generateMeta(Button, 'Button', {
  title: 'Atoms/Button',
}) satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Generate stories from features.json
const generatedStories = generateStories<typeof Button>('Button');

// Export individual stories
export const Primary: Story = generatedStories.primary || {
  args: {
    variant: 'contained',
    color: 'primary',
    text: 'Primary Button',
  },
};

export const Secondary: Story = generatedStories.secondary || {
  args: {
    variant: 'outlined',
    color: 'secondary',
    text: 'Secondary Button',
  },
};

export const WithIcon: Story = generatedStories.withIcon || {
  args: {
    variant: 'contained',
    startIcon: 'Add',
    text: 'Add Item',
  },
};

export const Loading: Story = generatedStories.loading || {
  args: {
    variant: 'contained',
    disabled: true,
    text: 'Loading...',
  },
};
