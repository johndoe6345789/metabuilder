import type { ComponentInstance } from '@/lib/types/builder-types'

export const buildHeaderActions = (): ComponentInstance[] => [
  {
    id: 'header_login_btn',
    type: 'Button',
    props: {
      children: 'Login',
      variant: 'default',
      size: 'sm',
    },
    children: [],
  },
]

export const buildProfileCard = (): ComponentInstance => ({
  id: 'comp_profile',
  type: 'Card',
  props: {
    className: 'p-6',
  },
  children: [
    {
      id: 'comp_profile_header',
      type: 'Heading',
      props: {
        level: 2,
        children: 'User Profile',
        className: 'text-2xl font-bold mb-4',
      },
      children: [],
    },
    {
      id: 'comp_profile_content',
      type: 'Container',
      props: {
        className: 'space-y-4',
      },
      children: [
        {
          id: 'comp_profile_bio',
          type: 'Textarea',
          props: {
            placeholder: 'Tell us about yourself...',
            className: 'min-h-32',
          },
          children: [],
        },
        {
          id: 'comp_profile_save',
          type: 'Button',
          props: {
            children: 'Save Profile',
            variant: 'default',
          },
          children: [],
        },
      ],
    },
  ],
})

export const buildCommentsCard = (): ComponentInstance => ({
  id: 'comp_comments',
  type: 'Card',
  props: {
    className: 'p-6',
  },
  children: [
    {
      id: 'comp_comments_header',
      type: 'Heading',
      props: {
        level: 2,
        children: 'Community Comments',
        className: 'text-2xl font-bold mb-4',
      },
      children: [],
    },
    {
      id: 'comp_comments_input',
      type: 'Textarea',
      props: {
        placeholder: 'Share your thoughts...',
        className: 'mb-4',
      },
      children: [],
    },
    {
      id: 'comp_comments_post',
      type: 'Button',
      props: {
        children: 'Post Comment',
        variant: 'default',
      },
      children: [],
    },
  ],
})
