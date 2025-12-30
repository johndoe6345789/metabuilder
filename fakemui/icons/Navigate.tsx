import React from 'react';
import { SvgIcon, SvgIconProps } from '../core/SvgIcon';

/**
 * Navigate icon - represents navigation action
 */
export const Navigate = React.forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
  </SvgIcon>
));

Navigate.displayName = 'Navigate';
export default Navigate;
