import React from 'react';
import { SvgIcon, SvgIconProps } from '../core/SvgIcon';

/**
 * Validate icon - represents validation/verification
 */
export const Validate = React.forwardRef<SVGSVGElement, SvgIconProps>((props, ref) => (
  <SvgIcon ref={ref} {...props}>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </SvgIcon>
));

Validate.displayName = 'Validate';
export default Validate;
