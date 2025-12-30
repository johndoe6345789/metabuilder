import React from 'react';
import { SvgIcon, SvgIconProps } from '../core/SvgIcon';

/**
 * Level icon - represents permission level
 */
export const Level = React.forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 13.27L5 13.5v4l7 4 7-4v-4l-7 2.77z" />
  </SvgIcon>
));

Level.displayName = 'Level';
export default Level;
