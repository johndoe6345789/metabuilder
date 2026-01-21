import type { Meta, StoryObj } from '@storybook/react';
import featuresConfig from '@/config/features.json';
import DataGrid from './DataGrid';

const meta = {
  title: 'Admin/DataGrid (From JSON)',
  component: DataGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'DataGrid component with stories dynamically loaded from features.json',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Dynamically generate stories from features.json
const dataGridStories = featuresConfig.storybookStories.DataGrid;

// Default Story
export const Default: Story = {
  name: dataGridStories.default.name,
  args: dataGridStories.default.args,
};

// With Actions Story
export const WithActions: Story = {
  name: dataGridStories.withActions.name,
  args: {
    ...dataGridStories.withActions.args,
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked'),
  },
};

// Empty State
export const Empty: Story = {
  name: dataGridStories.empty.name,
  args: dataGridStories.empty.args,
};
