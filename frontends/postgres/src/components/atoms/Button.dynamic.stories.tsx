import type { Meta, StoryObj } from '@storybook/react';
import featuresConfig from '@/config/features.json';
import Button, { type ButtonProps } from './Button';

const meta = {
  title: 'Atoms/Button (From JSON)',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Button component with stories dynamically loaded from features.json',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Dynamically generate stories from features.json
const buttonStories = featuresConfig.storybookStories.Button;

// Primary Button
export const Primary: Story = {
  name: buttonStories.primary.name,
  args: buttonStories.primary.args as Partial<ButtonProps>,
};

// Secondary Button
export const Secondary: Story = {
  name: buttonStories.secondary.name,
  args: buttonStories.secondary.args as Partial<ButtonProps>,
};

// Button with Icon
export const WithIcon: Story = {
  name: buttonStories.withIcon.name,
  args: buttonStories.withIcon.args as Partial<ButtonProps>,
};

// Loading State
export const Loading: Story = {
  name: buttonStories.loading.name,
  args: buttonStories.loading.args as Partial<ButtonProps>,
};
