/**
 * Shared styles configuration
 * Defines reusable CSS class names for consistent styling across the app
 */

export const styles = {
  links: {
    primary: 'text-blue-700 hover:border-b-2 hover:border-blue-700',
    primaryBold: 'font-bold text-blue-700 hover:border-b-2 hover:border-blue-700',
    hoverBlue: 'hover:text-blue-700',
    nav: 'border-none text-gray-700 hover:text-gray-900',
  },
  text: {
    centerSmall: 'text-center text-sm',
    base: 'text-base',
  },
  spacing: {
    marginTop2: 'mt-2',
    marginTop3: 'mt-3',
    marginTop5: 'mt-5',
  },
  image: {
    centerMarginTop: 'mx-auto mt-2',
  },
  headings: {
    h2Bold: 'mt-5 text-2xl font-bold',
  },
  lists: {
    baseMarginTop: 'mt-3 text-base',
  },
  containers: {
    contentPadding: 'py-5 text-xl [&_p]:my-6',
  },
} as const;
