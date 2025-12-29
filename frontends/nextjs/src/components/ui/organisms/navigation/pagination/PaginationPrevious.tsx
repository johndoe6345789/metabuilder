'use client'

import { forwardRef } from 'react'

import { PreviousIcon } from './paginationIcons'
import { PaginationLink } from './PaginationLink'
import { type PaginationLinkProps } from './paginationTypes'

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
