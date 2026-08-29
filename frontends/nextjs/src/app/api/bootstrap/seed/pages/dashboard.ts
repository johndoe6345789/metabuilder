/** The demo site's /dashboard page. */

import {
  body,
  button,
  card,
  heading,
  pageShell,
  paper,
  stack,
} from '../page-builders'

export const DASHBOARD_PAGE = {
    id: 'page_demo_site_dashboard',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/dashboard',
    title: 'Dashboard',
    description: 'Demo tenant dashboard surface.',
    icon: 'dashboard',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-dashboard',
      name: 'DemoSiteDashboard',
      description: 'Dashboard page for the demo tenant',
      render: paper(
        [
          stack(
            [
              heading('Dashboard', 'h4'),
              stack(
                [
                  card([heading('Pages', 'h6'), body('8 live pages')], {
                    style: { padding: '1rem', minWidth: '10rem' },
                  }),
                  card([heading('Forms', 'h6'), body('2 input sections')], {
                    style: { padding: '1rem', minWidth: '10rem' },
                  }),
                  card(
                    [
                      heading('Actions', 'h6'),
                      body('Multiple navigation targets'),
                    ],
                    { style: { padding: '1rem', minWidth: '10rem' } }
                  ),
                ],
                { direction: 'row', style: { gap: '1rem', flexWrap: 'wrap' } }
              ),
              stack(
                [
                  button('Back home', '/app/demo-site'),
                  button('Open contact', '/app/demo-site/contact', 'outlined'),
                ],
                {
                  direction: 'row',
                  style: { gap: '0.75rem', flexWrap: 'wrap' },
                }
              ),
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
    requiresAuth: true,
    isPublished: true,
    sortOrder: 60,
  }
