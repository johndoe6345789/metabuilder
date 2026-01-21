import type { Meta, StoryObj } from '@storybook/react';
import featuresConfig from '@/config/features.json';
import ConfirmDialog from './ConfirmDialog';

const meta = {
  title: 'Admin/ConfirmDialog (From JSON)',
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ConfirmDialog component with stories dynamically loaded from features.json',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Dynamically generate stories from features.json
const confirmDialogStories = featuresConfig.storybookStories.ConfirmDialog;

// Default Story
export const Default: Story = {
  name: confirmDialogStories.default.name,
  args: {
    ...confirmDialogStories.default.args,
    onConfirm: () => console.log('Confirmed'),
    onCancel: () => console.log('Cancelled'),
  },
};

// Delete Warning Story
export const DeleteWarning: Story = {
  name: confirmDialogStories.deleteWarning.name,
  args: {
    ...confirmDialogStories.deleteWarning.args,
    onConfirm: () => console.log('Confirmed delete'),
    onCancel: () => console.log('Cancelled delete'),
  },
};
