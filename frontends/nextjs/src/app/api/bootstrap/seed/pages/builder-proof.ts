/** The demo site's /builder-proof page. */


export const BUILDER_PROOF_PAGE = {
    id: 'page_demo_site_builder_proof',
    tenantId: 'demo-site',
    packageId: 'god_builder',
    path: '/builder-proof',
    title: 'Builder Proof',
    description: 'A page rendered from the website builder tree format.',
    icon: 'construction',
    component: 'component_tree',
    tree: {
      id: 'root',
      type: 'container',
      props: { direction: 'column', gap: 14 },
      children: [
        {
          id: 'proof_heading',
          type: 'heading',
          props: { text: 'Website Builder Proof' },
          children: [],
        },
        {
          id: 'proof_intro',
          type: 'text',
          props: {
            text: 'This page uses the same block tree the god-panel builder publishes.',
          },
          children: [],
        },
        {
          id: 'proof_card',
          type: 'card',
          props: {},
          children: [
            {
              id: 'proof_card_text',
              type: 'text',
              props: {
                text: 'Cards, text, headings, and linked buttons render from DBAL.',
              },
              children: [],
            },
          ],
        },
        {
          id: 'proof_actions',
          type: 'container',
          props: { direction: 'row', gap: 12 },
          children: [
            {
              id: 'proof_contact',
              type: 'button',
              props: {
                label: 'Open contact',
                href: '/app/demo-site/contact',
              },
              children: [],
            },
            {
              id: 'proof_thanks',
              type: 'button',
              props: {
                label: 'Open thanks',
                href: '/app/demo-site/thanks',
                variant: 'outlined',
              },
              children: [],
            },
          ],
        },
      ],
    },
    level: 1,
    requiresAuth: false,
    isPublished: true,
    sortOrder: 80,
  }
