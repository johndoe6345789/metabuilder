/** The demo site's /pricing page. */

import {
  body,
  button,
  card,
  heading,
  pageShell,
  paper,
  stack,
} from '../page-builders'

export const PRICING_PAGE = {
    id: 'page_demo_site_pricing',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/pricing',
    title: 'Pricing',
    description: 'Simple plan cards for the demo tenant.',
    icon: 'payments',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-pricing',
      name: 'DemoSitePricing',
      description: 'Pricing page for the demo tenant',
      render: paper(
        [
          stack(
            [
              heading('Pricing', 'h4'),
              body('Three plans to test card layouts and CTA buttons.'),
              stack(
                [
                  card(
                    [
                      heading('Starter', 'h6'),
                      body('Good for a single tenant site.'),
                      body('$0 / month'),
                    ],
                    { style: { padding: '1rem', minWidth: '14rem' } }
                  ),
                  card(
                    [
                      heading('Pro', 'h6'),
                      body('For active builders and editors.'),
                      body('$25 / month'),
                    ],
                    { style: { padding: '1rem', minWidth: '14rem' } }
                  ),
                  card(
                    [
                      heading('Supergod', 'h6'),
                      body('For cross-tenant control and operations.'),
                      body('$75 / month'),
                    ],
                    { style: { padding: '1rem', minWidth: '14rem' } }
                  ),
                ],
                { direction: 'row', style: { gap: '1rem', flexWrap: 'wrap' } }
              ),
              button('Start with Pro', '/app/demo-site/contact'),
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
    sortOrder: 30,
  }
