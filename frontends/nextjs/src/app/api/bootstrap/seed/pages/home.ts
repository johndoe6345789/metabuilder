/** The demo site's / page. */

import {
  body,
  button,
  card,
  heading,
  pageShell,
  paper,
  stack,
} from '../page-builders'

export const HOME_PAGE = {
    id: 'page_demo_site_home',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/',
    title: 'Demo Site',
    description: 'Interactive showcase site for MetaBuilder.',
    icon: 'web',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-home',
      name: 'DemoSiteHome',
      description: 'Home page for the demo tenant',
      render: paper(
        [
          stack(
            [
              heading('MetaBuilder Demo Site', 'h3'),
              body(
                'A seeded tenant site with real navigation, forms, and content sections.'
              ),
              stack(
                [
                  button('About', '/app/demo-site/about'),
                  button('Services', '/app/demo-site/services', 'outlined'),
                  button('Contact', '/app/demo-site/contact', 'outlined'),
                ],
                {
                  direction: 'row',
                  style: { gap: '0.75rem', flexWrap: 'wrap' },
                }
              ),
              card(
                [
                  stack(
                    [
                      heading('What is seeded', 'h6'),
                      body('Eight connected pages under one tenant.'),
                      body(
                        'Buttons, inputs, and links that render in the browser.'
                      ),
                      body(
                        'A dashboard, FAQ, and a contact flow you can click through.'
                      ),
                    ],
                    { style: { gap: '0.75rem' } }
                  ),
                ],
                { style: { padding: '1rem' } }
              ),
            ],
            { style: { gap: '1.25rem' } }
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
    sortOrder: 0,
  }
