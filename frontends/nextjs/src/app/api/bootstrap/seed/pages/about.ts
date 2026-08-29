/** The demo site's /about page. */

import {
  body,
  button,
  card,
  chip,
  heading,
  pageShell,
  paper,
  stack,
} from '../page-builders'

export const ABOUT_PAGE = {
    id: 'page_demo_site_about',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/about',
    title: 'About the Demo Site',
    description: 'Overview of the seeded tenant experience.',
    icon: 'info',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-about',
      name: 'DemoSiteAbout',
      description: 'About page for the demo tenant',
      render: paper(
        [
          stack(
            [
              heading('About the Demo Site', 'h4'),
              stack(
                [
                  chip('Tenant', 'primary'),
                  chip('DBAL-backed', 'success'),
                  chip('Interactive', 'secondary'),
                ],
                { direction: 'row', style: { gap: '0.5rem', flexWrap: 'wrap' } }
              ),
              card(
                [
                  stack(
                    [
                      body(
                        'This site is seeded from DBAL records and rendered at runtime.'
                      ),
                      body(
                        'The point is to exercise navigation, content, and form components instead of static marketing copy.'
                      ),
                    ],
                    { style: { gap: '0.75rem' } }
                  ),
                ],
                { style: { padding: '1rem' } }
              ),
              button('Back home', '/app/demo-site', 'outlined'),
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
    sortOrder: 10,
  }
