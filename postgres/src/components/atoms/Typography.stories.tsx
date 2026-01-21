import type { Meta, StoryObj } from '@storybook/react';
import Typography from './Typography';

const meta = {
  title: 'Atoms/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'button', 'overline'],
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Heading1: Story = {
  args: {
    variant: 'h1',
    text: 'Heading 1',
  },
};

export const Heading4: Story = {
  args: {
    variant: 'h4',
    text: 'Heading 4',
  },
};

export const Body: Story = {
  args: {
    variant: 'body1',
    text: 'This is body text with regular weight and size.',
  },
};

export const Caption: Story = {
  args: {
    variant: 'caption',
    color: 'text.secondary',
    text: 'Caption text - smaller and secondary color',
  },
};
