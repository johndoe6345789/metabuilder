import React from 'react'
import { classNames } from '../utils/classNames'

/**
 * Masonry - CSS-only masonry layout
 */
export function Masonry({
  children,
  columns = 4,
  spacing = 1,
  defaultHeight = 450,
  defaultColumns = 4,
  defaultSpacing = 1,
  className,
  style,
  component: Component = 'div',
  ...props
}) {
  const gap = typeof spacing === 'number' ? spacing * 8 : spacing

  return (
    <Component
      className={classNames('fakemui-masonry', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
        gridAutoRows: '1px',
        ...style,
      }}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className="fakemui-masonry-item"
          style={{
            gridRowEnd: `span ${defaultHeight}`,
          }}
        >
          {child}
        </div>
      ))}
    </Component>
  )
}

export default Masonry
