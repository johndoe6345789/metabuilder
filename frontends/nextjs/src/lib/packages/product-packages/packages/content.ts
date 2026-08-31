import type { ProductPackage } from '../types'

export const CONTENT_PACKAGE: ProductPackage = {
  id: 'content',
  name: 'Content',
  tagline: 'Blog, news feed and media',
  icon: 'edit_note',
  color: '#B5410B',
  features: [
    'Blog with categories and tags',
    'Rich text and Markdown editor',
    'Media library and image uploads',
    'Auto-generated RSS feed',
  ],
  defaultRoutes: [
    { path: '/blog', title: 'Blog' },
    { path: '/media', title: 'Media' },
  ],
  category: 'content',
}
