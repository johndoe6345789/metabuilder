/**
 * Shared styles configuration
 * Defines reusable CSS class names for consistent styling across the app
 */
import publicStyles from '@/styles/public.module.scss';

export const styles = {
  links: {
    primary: publicStyles.linkPrimary,
    primaryBold: publicStyles.linkPrimaryBold,
    hoverBlue: publicStyles.linkHoverBlue,
    nav: publicStyles.linkNav,
  },
  text: {
    centerSmall: publicStyles.textCenterSmall,
    base: publicStyles.textBase,
  },
  spacing: {
    marginTop2: publicStyles.marginTop2,
    marginTop3: publicStyles.marginTop3,
    marginTop5: publicStyles.marginTop5,
  },
  image: {
    centerMarginTop: publicStyles.imageCenterMarginTop,
  },
  headings: {
    h2Bold: publicStyles.h2Bold,
  },
  lists: {
    baseMarginTop: publicStyles.baseMarginTop,
  },
  containers: {
    contentPadding: publicStyles.contentPadding,
  },
} as const;
