'use client'

import { forwardRef } from 'react'

import { NextIcon } from './paginationIcons'
import { PaginationLink } from './PaginationLink'
import { type PaginationLinkProps } from './paginationTypes'

const PaginationNext = forwardRef<HTMLButtonElement, Omit<PaginationLinkProps, 'children'>>(
  (props, ref) => {
    return (
      <PaginationLink ref={ref} {...props}>
        <NextIcon />
      </PaginationLink>
    )
  }
)
PaginationNext.displayName = 'PaginationNext'

export { PaginationNext }
