/**
 * Navigation configuration for marketing layout
 * Defines navigation items for left and right navigation menus
 */

export type NavLink = {
  id: string;
  translationKey: string;
  href: string;
  external?: boolean;
  label?: string; // For links without translation (like GitHub)
};

export type NavigationConfig = {
  left: NavLink[];
  right: NavLink[];
};

export const marketingNavigation: NavigationConfig = {
  left: [
    {
      id: 'home',
      translationKey: 'home_link',
      href: '/',
    },
    {
      id: 'about',
      translationKey: 'about_link',
      href: '/about/',
    },
    {
      id: 'counter',
      translationKey: 'counter_link',
      href: '/counter/',
    },
    {
      id: 'portfolio',
      translationKey: 'portfolio_link',
      href: '/portfolio/',
    },
    {
      id: 'github',
      label: 'GitHub',
      translationKey: '',
      href: 'https://github.com/ixartz/Next-js-Boilerplate',
      external: true,
    },
  ],
  right: [
    {
      id: 'sign-in',
      translationKey: 'sign_in_link',
      href: '/sign-in/',
    },
    {
      id: 'sign-up',
      translationKey: 'sign_up_link',
      href: '/sign-up/',
    },
  ],
};
