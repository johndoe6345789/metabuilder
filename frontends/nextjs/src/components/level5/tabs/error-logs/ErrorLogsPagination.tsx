import { Button } from '@/components/ui'

interface ErrorLogsPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ErrorLogsPagination({ page, totalPages, onPageChange }: ErrorLogsPaginationProps) {
  const canGoBack = page > 1
  const canGoForward = page < totalPages

  return (
    <div className="flex items-center justify-end gap-2 mt-4">
      <Button
        size="sm"
        variant="outline"
        className="border-white/20 text-white hover:bg-white/10"
        onClick={() => onPageChange(page - 1)}
        disabled={!canGoBack}
      >
        Previous
      </Button>
      <div className="text-xs text-gray-400">
        Page {page} of {totalPages}
      </div>
      <Button
        size="sm"
        variant="outline"
        className="border-white/20 text-white hover:bg-white/10"
        onClick={() => onPageChange(page + 1)}
        disabled={!canGoForward}
      >
        Next
      </Button>
    </div>
  )
}
