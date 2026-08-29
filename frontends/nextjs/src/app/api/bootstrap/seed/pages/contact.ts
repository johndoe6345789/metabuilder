/** The demo site's /contact page. */

import {
  body,
  button,
  heading,
  pageShell,
  paper,
  stack,
} from '../page-builders'

export const CONTACT_PAGE = {
    id: 'page_demo_site_contact',
    tenantId: 'demo-site',
    packageId: 'demo_site',
    path: '/contact',
    title: 'Contact',
    description: 'Contact form and call to action.',
    icon: 'mail',
    component: 'page',
    tree: pageShell({
      id: 'demo-site-contact',
      name: 'DemoSiteContact',
      description: 'Contact page for the demo tenant',
      render: paper(
        [
          stack(
            [
              heading('Contact', 'h4'),
              body(
                'These fields render interactively so the page feels like a real site.'
              ),
              stack(
                [
                  {
                    type: 'TextField',
                    props: {
                      label: 'Name',
                      fullWidth: true,
                      placeholder: 'Your name',
                    },
                    children: [],
                  },
                  {
                    type: 'TextField',
                    props: {
                      label: 'Email',
                      fullWidth: true,
                      placeholder: 'you@example.com',
                    },
                    children: [],
                  },
                  {
                    type: 'TextField',
                    props: {
                      label: 'What are you building?',
                      fullWidth: true,
                      multiline: true,
                      rows: 4,
                    },
                    children: [],
                  },
                ],
                { style: { gap: '1rem' } }
              ),
              stack(
                [
                  button('Send inquiry', '/app/demo-site/thanks'),
                  button('View FAQ', '/app/demo-site/faq', 'outlined'),
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
    sortOrder: 40,
  }
