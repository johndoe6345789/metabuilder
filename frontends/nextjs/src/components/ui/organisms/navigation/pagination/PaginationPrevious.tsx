'use client'

import { forwardRef } from 'react'
import { PaginationLink } from './PaginationLink'
import { PreviousIcon, type PaginationLinkProps } from './paginationUtils'

const PaginationPrevious = forwardRef<HTMLButtonElement, Omit<PaginationLinkProps, 'children'>>(
  (props, ref) => {
    return (
      <PaginationLink ref={ref} {...props}>
        <PreviousIcon />
      </PaginationLink>
    )
  }
)
PaginationPrevious.displayName = 'PaginationPrevious'

export { PaginationPrevious }
