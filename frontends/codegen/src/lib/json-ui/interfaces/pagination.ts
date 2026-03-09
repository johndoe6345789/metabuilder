import { ComponentProps } from 'react'

export interface PaginationProps extends ComponentProps<'nav'> {
  className?: string
}

export interface PaginationContentProps extends ComponentProps<'ul'> {
  className?: string
}

export interface PaginationItemProps extends ComponentProps<'li'> {}

export interface PaginationLinkProps extends ComponentProps<'a'> {
  isActive?: boolean
  size?: 'default' | 'icon'
  className?: string
}

export interface PaginationPreviousProps extends PaginationLinkProps {}

export interface PaginationNextProps extends PaginationLinkProps {}

export interface PaginationEllipsisProps extends ComponentProps<'span'> {
  className?: string
}
