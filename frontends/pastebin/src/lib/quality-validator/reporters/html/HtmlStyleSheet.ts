/**
 * HTML Report Styling Module
 * Assembles all embedded CSS for HTML reports
 */

import {
  getResetStyles,
  getLayoutStyles,
  getTypographyStyles,
  getHeaderStyles,
  getFooterStyles,
} from './styles-base.js';
import {
  getCardStyles,
  getScoreStyles,
  getMetricsStyles,
  getFindingsStyles,
} from './styles-components.js';
import {
  getRecommendationStyles,
  getTrendStyles,
  getResponsiveStyles,
  getAnimationStyles,
} from './styles-extras.js';

/**
 * Generate all embedded CSS styles for HTML reports
 *
 * @returns {string} Complete CSS stylesheet as a string
 */
export function getStyles(): string {
  return [
    getResetStyles(),
    getLayoutStyles(),
    getTypographyStyles(),
    getHeaderStyles(),
    getCardStyles(),
    getScoreStyles(),
    getMetricsStyles(),
    getFindingsStyles(),
    getRecommendationStyles(),
    getTrendStyles(),
    getFooterStyles(),
    getResponsiveStyles(),
    getAnimationStyles(),
  ].join('\n');
}
