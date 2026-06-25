import React from 'react'
import classNames from 'classnames'
import { sxToStyle } from '../utils/sx'
import styles from '../../../scss/atoms/grid.module.scss'

// CSS Grid gap sizes
export type GridGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Auto-grid min-width sizes
export type AutoGridSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Grid column counts (1-6)
export type GridCols = 1 | 2 | 3 | 4 | 5 | 6

// Flexbox column sizes (1-12)
export type FlexCol = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | boolean

// Grid item span options
export type GridSpan = 2 | 3 | 'full'

// Grid alignment options
export type GridAlign = 'start' | 'center' | 'end' | 'stretch'

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode

  // Mode selection
  /** Use CSS Grid layout (default: false, uses Flexbox) */
  cssGrid?: boolean

  // Flexbox mode props (Bootstrap-style 12-column grid)
  container?: boolean
  item?: boolean
  xs?: FlexCol
  sm?: FlexCol
  md?: FlexCol
  lg?: FlexCol
  xl?: FlexCol
  /** Flexbox gap (1-6) */
  spacing?: 1 | 2 | 3 | 4 | 5 | 6 | string | number
  direction?: 'row' | 'column'
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

  // CSS Grid mode props
  /** Fixed column count (1-6) */
  cols?: GridCols
  /** CSS Grid gap size */
  gap?: GridGap
  /** Enable auto-fit responsive grid */
  autoGrid?: boolean
  /** Min-width for auto-grid items */
  minWidth?: AutoGridSize
  /** Grid item column span */
  span?: GridSpan
  /** Grid item row span */
  rowSpan?: 2
  /** Grid alignment */
  gridAlign?: GridAlign
  /** Enable dense auto-placement */
  dense?: boolean
  /** Enable masonry layout */
  masonry?: boolean | 2 | 3 | 4

  sx?: Record<string, unknown>
  testId?: string
}

// Map gap sizes to style class names
const gapClassMap: Record<GridGap, string> = {
  xs: styles.gridGapXs,
  sm: styles.gridGapSm,
  md: styles.gridGapMd,
  lg: styles.gridGapLg,
  xl: styles.gridGapXl,
}

// Map auto-grid sizes to style class names
const autoGridClassMap: Record<AutoGridSize, string> = {
  xs: styles.autoGridXs,
  sm: styles.autoGridSm,
  md: styles.autoGridMd,
  lg: styles.autoGridLg,
  xl: styles.autoGridXl,
}

// Map column counts to style class names
const colsClassMap: Record<GridCols, string> = {
  1: styles.gridCols1,
  2: styles.gridCols2,
  3: styles.gridCols3,
  4: styles.gridCols4,
  5: styles.gridCols5,
  6: styles.gridCols6,
}

// Map flex column sizes (base)
const colClassMap: Record<number, string> = {
  1: styles.col1,
  2: styles.col2,
  3: styles.col3,
  4: styles.col4,
  5: styles.col5,
  6: styles.col6,
  7: styles.col7,
  8: styles.col8,
  9: styles.col9,
  10: styles.col10,
  11: styles.col11,
  12: styles.col12,
}

// Map flex column sizes (sm breakpoint)
const colSmClassMap: Record<number, string> = {
  1: styles.colSm1,
  2: styles.colSm2,
  3: styles.colSm3,
  4: styles.colSm4,
  5: styles.colSm5,
  6: styles.colSm6,
  7: styles.colSm7,
  8: styles.colSm8,
  9: styles.colSm9,
  10: styles.colSm10,
  11: styles.colSm11,
  12: styles.colSm12,
}

// Map flex column sizes (md breakpoint)
const colMdClassMap: Record<number, string> = {
  1: styles.colMd1,
  2: styles.colMd2,
  3: styles.colMd3,
  4: styles.colMd4,
  5: styles.colMd5,
  6: styles.colMd6,
  7: styles.colMd7,
  8: styles.colMd8,
  9: styles.colMd9,
  10: styles.colMd10,
  11: styles.colMd11,
  12: styles.colMd12,
}

// Map flex column sizes (lg breakpoint)
const colLgClassMap: Record<number, string> = {
  3: styles.colLg3,
  4: styles.colLg4,
  6: styles.colLg6,
  12: styles.colLg12,
}

// Map flexbox gap (1-6)
const flexGapClassMap: Record<number, string> = {
  1: styles.gap1,
  2: styles.gap2,
  3: styles.gap3,
  4: styles.gap4,
  5: styles.gap5,
  6: styles.gap6,
}

// Map grid alignment
const gridAlignClassMap: Record<GridAlign, string> = {
  start: styles.gridItemsStart,
  center: styles.gridItemsCenter,
  end: styles.gridItemsEnd,
  stretch: styles.gridItemsStretch,
}

// Helper to get column class for a breakpoint
const getColClass = (
  value: FlexCol | undefined,
  classMap: Record<number, string>
): string | undefined => {
  if (value === undefined) return undefined
  if (value === true) return classMap[12]
  if (typeof value === 'number' && classMap[value]) return classMap[value]
  return undefined
}

export const Grid: React.FC<GridProps> = ({
  children,
  cssGrid = false,
  // Flexbox props
  container,
  item,
  xs,
  sm,
  md,
  lg,
  xl,
  spacing,
  direction,
  alignItems,
  justifyContent,
  // CSS Grid props
  cols,
  gap,
  autoGrid,
  minWidth,
  span,
  rowSpan,
  gridAlign,
  dense,
  masonry,
  // Common props
  className,
  sx,
  style,
  testId,
  ...props
}) => {
  // Determine if using CSS Grid or Flexbox mode
  const isCssGrid = cssGrid || cols !== undefined || autoGrid || masonry

  // Build class list
  const classes = classNames(
    // CSS Grid mode classes
    isCssGrid && {
      // Base grid
      [styles.grid]: !autoGrid && !masonry,
      [styles.autoGrid]: autoGrid,

      // Column count
      [colsClassMap[cols as GridCols]]: cols && !autoGrid && !masonry,

      // Gap
      [gapClassMap[gap as GridGap]]: gap,

      // Auto-grid min-width
      [autoGridClassMap[minWidth as AutoGridSize]]: autoGrid && minWidth,

      // Span classes (for grid items)
      [styles.gridSpan2]: span === 2,
      [styles.gridSpan3]: span === 3,
      [styles.gridSpanFull]: span === 'full',
      [styles.gridRowSpan2]: rowSpan === 2,

      // Alignment
      [gridAlignClassMap[gridAlign as GridAlign]]: gridAlign,

      // Dense placement
      [styles.gridDense]: dense,

      // Masonry layout
      [styles.masonryGrid]: masonry === true || masonry === 3,
      [styles.masonryGrid2]: masonry === 2,
      [styles.masonryGrid4]: masonry === 4,
    },

    // Flexbox mode classes
    !isCssGrid && {
      // Container/Item
      [styles.gridContainer]: container,
      [styles.gridItem]: item,

      // Flexbox gap (spacing prop)
      [flexGapClassMap[Number(spacing)]]:
        typeof spacing === 'number' && flexGapClassMap[spacing],

      // Responsive columns
      [getColClass(xs, colClassMap) || '']: xs !== undefined,
      [getColClass(sm, colSmClassMap) || '']: sm !== undefined,
      [getColClass(md, colMdClassMap) || '']: md !== undefined,
      [getColClass(lg, colLgClassMap) || '']: lg !== undefined,
    },

    // Custom className
    className
  )

  // Inline styles for flexbox direction and alignment (not in CSS module)
  const inlineStyles: React.CSSProperties = {
    ...sxToStyle(sx),
    ...style,
  }

  // Add flexbox-specific inline styles
  if (!isCssGrid) {
    if (direction) {
      inlineStyles.flexDirection = direction
    }
    if (alignItems) {
      const alignMap: Record<string, string> = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        stretch: 'stretch',
      }
      inlineStyles.alignItems = alignMap[alignItems] || alignItems
    }
    if (justifyContent) {
      const justifyMap: Record<string, string> = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        between: 'space-between',
        around: 'space-around',
        evenly: 'space-evenly',
      }
      inlineStyles.justifyContent = justifyMap[justifyContent] || justifyContent
    }
  }

  return (
    <div className={classes} style={inlineStyles} data-testid={testId} {...props}>
      {children}
    </div>
  )
}

// Export GridItem as a convenience component for masonry layouts
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  /** For masonry grid items */
  masonry?: boolean
  sx?: Record<string, unknown>
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  masonry,
  className,
  sx,
  style,
  ...props
}) => {
  const classes = classNames(
    {
      [styles.masonryGridItem]: masonry,
      [styles.gridItem]: !masonry,
    },
    className
  )

  return (
    <div className={classes} style={{ ...sxToStyle(sx), ...style }} {...props}>
      {children}
    </div>
  )
}
