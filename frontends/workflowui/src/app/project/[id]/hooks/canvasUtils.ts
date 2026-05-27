/** canvasUtils - Formatting helpers for project canvas */

export function formatDate(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function getStatusColor(
  status: string
): 'success' | 'warning' | 'info' | 'error' {
  if (status === 'published' || status === 'active')
    return 'success';
  if (status === 'draft') return 'info';
  if (status === 'paused') return 'warning';
  return 'error';
}

const STATUS_BORDER: Record<string, string> = {
  published: 'var(--md-sys-color-success)',
  active: 'var(--md-sys-color-success)',
  draft: 'var(--md-sys-color-primary)',
  paused: 'var(--md-sys-color-warning)',
};

export function getStatusBorderColor(
  status: string
): string {
  return (
    STATUS_BORDER[status] ?? 'var(--md-sys-color-error)'
  );
}
