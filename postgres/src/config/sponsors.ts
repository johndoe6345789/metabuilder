/**
 * Sponsors configuration for marketing pages
 * Defines sponsor sections that appear at the bottom of marketing pages
 */

export type SponsorConfig = {
  id: string;
  name: string;
  description: string;
  url: string;
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  translationKey: string;
};

export type PageSponsorsConfig = {
  [page: string]: SponsorConfig[];
};

export const sponsors: PageSponsorsConfig = {
  about: [
    {
      id: 'crowdin',
      name: 'Crowdin',
      description: 'Translation Management System',
      url: 'https://l.crowdin.com/next-js',
      logo: {
        src: '/assets/images/crowdin-dark.png',
        alt: 'Crowdin Translation Management System',
        width: 128,
        height: 26,
      },
      translationKey: 'translation_powered_by',
    },
  ],
  portfolio: [
    {
      id: 'sentry',
      name: 'Sentry',
      description: 'Error Monitoring',
      url: 'https://sentry.io/for/nextjs/?utm_source=github&utm_medium=paid-community&utm_campaign=general-fy25q1-nextjs&utm_content=github-banner-nextjsboilerplate-logo',
      logo: {
        src: '/assets/images/sentry-dark.png',
        alt: 'Sentry',
        width: 128,
        height: 38,
      },
      translationKey: 'error_reporting_powered_by',
    },
  ],
  'portfolio-slug': [
    {
      id: 'coderabbit',
      name: 'CodeRabbit',
      description: 'AI Code Reviews',
      url: 'https://www.coderabbit.ai?utm_source=next_js_starter&utm_medium=github&utm_campaign=next_js_starter_oss_2025',
      logo: {
        src: '/assets/images/coderabbit-logo-light.svg',
        alt: 'CodeRabbit',
        width: 128,
        height: 22,
      },
      translationKey: 'code_review_powered_by',
    },
  ],
  counter: [
    {
      id: 'arcjet',
      name: 'Arcjet',
      description: 'Security and Bot Protection',
      url: 'https://launch.arcjet.com/Q6eLbRE',
      logo: {
        src: '/assets/images/arcjet-light.svg',
        alt: 'Arcjet',
        width: 128,
        height: 38,
      },
      translationKey: 'security_powered_by',
    },
  ],
};
