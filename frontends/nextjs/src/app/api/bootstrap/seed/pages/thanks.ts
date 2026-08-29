/** The demo site's /thanks page. */

import {
  body,
  button,
  heading,
  pageShell,
  paper,
  stack,
} from '../page-builders'

export const THANKS_PAGE = {
    id: 'page_demo_site_thanks',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/thanks',
    title: 'Thanks',
    description: 'Thank-you page after contact.',
    icon: 'check_circle',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-thanks',
      name: 'DemoSiteThanks',
      description: 'Thanks page for the demo tenant',
      render: paper(
        [
          stack(
            [
              heading('Thanks', 'h4'),
              body('The contact flow lands here so the button path is real.'),
              button('Return home', '/app/demo-site'),
            ],
            { style: { gap: '1rem' } }
          ),
        ],
        {
          style: {
            padding: '2rem',
            borderRadius: '24px',
            maxWidth: '72rem',
            margin: '0 auto',
          },
        }
      ),
    }),
    level: 1,
    requiresAuth: false,
    isPublished: true,
    sortOrder: 70,
  }
