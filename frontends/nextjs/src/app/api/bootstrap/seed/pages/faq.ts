/** The demo site's /faq page. */

import {
  button,
  heading,
  pageShell,
  paper,
  stack,
} from '../page-builders'

export const FAQ_PAGE = {
    id: 'page_demo_site_faq',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/faq',
    title: 'FAQ',
    description: 'Frequently asked questions.',
    icon: 'help',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-faq',
      name: 'DemoSiteFaq',
      description: 'FAQ page for the demo tenant',
      render: paper(
        [
          stack(
            [
              heading('FAQ', 'h4'),
              {
                type: 'List',
                props: {},
                children: [
                  {
                    type: 'ListItem',
                    props: {},
                    children: [
                      'Can I edit pages? Yes, via the god panel page routes tab.',
                    ],
                  },
                  {
                    type: 'ListItem',
                    props: {},
                    children: [
                      'Can I preview content? Yes, routes render from DBAL records.',
                    ],
                  },
                  {
                    type: 'ListItem',
                    props: {},
                    children: [
                      'Can I build interactive sites? Yes, buttons, inputs, cards, and layout blocks all render.',
                    ],
                  },
                ],
              },
              button('Open dashboard', '/app/demo-site/dashboard'),
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
    sortOrder: 50,
  }
