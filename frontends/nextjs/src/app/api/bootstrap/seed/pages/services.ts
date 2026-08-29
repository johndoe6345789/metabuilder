/** The demo site's /services page. */

import {
  body,
  button,
  card,
  heading,
  pageShell,
  paper,
  stack,
} from '../page-builders'

export const SERVICES_PAGE = {
    id: 'page_demo_site_services',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/services',
    title: 'Services',
    description: 'Service overview for the demo tenant.',
    icon: 'build',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-services',
      name: 'DemoSiteServices',
      description: 'Service page for the demo tenant',
      render: paper(
        [
          stack(
            [
              heading('Services', 'h4'),
              body('Three common building blocks for a tenant site.'),
              stack(
                [
                  card(
                    [
                      heading('Landing pages', 'h6'),
                      body('Fast pages with clear calls to action.'),
                    ],
                    { style: { padding: '1rem', minWidth: '16rem' } }
                  ),
                  card(
                    [
                      heading('Lead capture', 'h6'),
                      body('Forms that collect details and route users.'),
                    ],
                    { style: { padding: '1rem', minWidth: '16rem' } }
                  ),
                  card(
                    [
                      heading('Operations', 'h6'),
                      body('Dashboards and admin surfaces for real work.'),
                    ],
                    { style: { padding: '1rem', minWidth: '16rem' } }
                  ),
                ],
                { direction: 'row', style: { gap: '1rem', flexWrap: 'wrap' } }
              ),
              stack(
                [
                  button('Request a demo', '/app/demo-site/contact'),
                  button('View pricing', '/app/demo-site/pricing', 'outlined'),
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
    requiresAuth: false,
    isPublished: true,
    sortOrder: 20,
  }
