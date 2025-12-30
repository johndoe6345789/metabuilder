import React from 'react'

export const Pagination = ({
  count,
  page,
  onChange,
  size = 'medium',
  color = 'standard',
  variant = 'text',
  shape = 'circular',
  boundaryCount = 1,
  siblingCount = 1,
  showFirstButton = false,
  showLastButton = false,
  hidePrevButton = false,
  hideNextButton = false,
  disabled = false,
  renderItem,
  getItemAriaLabel,
  className = '',
  ...props
}) => {
  // Generate pagination items with ellipsis
  const generateItems = () => {
    const items = []
    
    // First button
    if (showFirstButton) {
      items.push({ type: 'first', page: 1, disabled: page === 1 || disabled })
    }
    
    // Previous button
    if (!hidePrevButton) {
      items.push({ type: 'previous', page: page - 1, disabled: page === 1 || disabled })
    }
    
    // Page numbers with ellipsis
    const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i)
    
    const startPages = range(1, Math.min(boundaryCount, count))
    const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count)
    
    const siblingsStart = Math.max(
      Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
      boundaryCount + 2
    )
    const siblingsEnd = Math.min(
      Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
      endPages.length > 0 ? endPages[0] - 2 : count - 1
    )
    
    const itemList = [
      ...startPages,
      ...(siblingsStart > boundaryCount + 2 ? ['start-ellipsis'] : boundaryCount + 1 < count - boundaryCount ? [boundaryCount + 1] : []),
      ...range(siblingsStart, siblingsEnd),
      ...(siblingsEnd < count - boundaryCount - 1 ? ['end-ellipsis'] : count - boundaryCount > boundaryCount ? [count - boundaryCount] : []),
      ...endPages,
    ]
    
    itemList.forEach((item) => {
      if (item === 'start-ellipsis' || item === 'end-ellipsis') {
        items.push({ type: 'ellipsis', page: null, disabled: true })
      } else {
        items.push({ type: 'page', page: item, selected: item === page, disabled })
      }
    })
    
    // Next button
    if (!hideNextButton) {
      items.push({ type: 'next', page: page + 1, disabled: page === count || disabled })
    }
    
    // Last button
    if (showLastButton) {
      items.push({ type: 'last', page: count, disabled: page === count || disabled })
    }
    
    return items
  }

  const items = generateItems()

  return (
    <nav className={`pagination pagination--${size} pagination--${color} pagination--${variant} pagination--${shape} ${className}`} aria-label="pagination navigation" {...props}>
      {items.map((item, index) => {
        if (renderItem) {
          return renderItem(item)
        }
        return (
          <PaginationItem
            key={index}
            {...item}
            size={size}
            color={color}
            variant={variant}
            shape={shape}
            onClick={() => item.page && onChange?.(item.page)}
          />
        )
      })}
    </nav>
  )
}

export const PaginationItem = ({
  type = 'page',
  page,
  selected = false,
  disabled = false,
  size = 'medium',
  color = 'standard',
  variant = 'text',
  shape = 'circular',
  onClick,
  className = '',
  ...props
}) => {
  const getContent = () => {
    switch (type) {
      case 'first': return '⟨⟨'
      case 'previous': return '‹'
      case 'next': return '›'
      case 'last': return '⟩⟩'
      case 'ellipsis': return '…'
      default: return page
    }
  }

  if (type === 'ellipsis') {
    return (
      <span className={`pagination-item pagination-item--ellipsis ${className}`} {...props}>
        {getContent()}
      </span>
    )
  }

  return (
    <button
      className={`pagination-item pagination-item--${type} pagination-item--${size} pagination-item--${variant} pagination-item--${shape} ${selected ? 'pagination-item--selected' : ''} ${disabled ? 'pagination-item--disabled' : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
      aria-current={selected ? 'page' : undefined}
      {...props}
    >
      {getContent()}
    </button>
  )
}
