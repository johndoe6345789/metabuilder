import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AdminTabs } from './AdminTabs'

describe('AdminTabs', () => {
  it('shows counts in the Users and Comments tab labels', () => {
    render(
      <AdminTabs
        activeTab={0}
        onChange={vi.fn()}
        userCount={5}
        commentCount={2}
      >
        <div>users content</div>
      </AdminTabs>
    )
    expect(screen.getByText('Users (5)')).toBeTruthy()
    expect(screen.getByText('Comments (2)')).toBeTruthy()
  })

  it('renders children in the active Users panel', () => {
    render(
      <AdminTabs
        activeTab={0}
        onChange={vi.fn()}
        userCount={1}
        commentCount={0}
      >
        <div>the user table</div>
      </AdminTabs>
    )
    expect(screen.getByText('the user table')).toBeTruthy()
  })

  it('pluralizes the comment count correctly', () => {
    render(
      <AdminTabs
        activeTab={1}
        onChange={vi.fn()}
        userCount={0}
        commentCount={1}
      >
        <div />
      </AdminTabs>
    )
    expect(screen.getByText(/1 comment are stored/)).toBeTruthy()
  })

  it('pluralizes multiple comments', () => {
    render(
      <AdminTabs
        activeTab={1}
        onChange={vi.fn()}
        userCount={0}
        commentCount={3}
      >
        <div />
      </AdminTabs>
    )
    expect(screen.getByText(/3 comments are stored/)).toBeTruthy()
  })

  it('calls onChange when a tab is clicked', () => {
    const onChange = vi.fn()
    render(
      <AdminTabs
        activeTab={0}
        onChange={onChange}
        userCount={0}
        commentCount={0}
      >
        <div />
      </AdminTabs>
    )
    fireEvent.click(screen.getByText('Entities'))
    expect(onChange).toHaveBeenCalledWith(2)
  })
})
