const UNITS = [
  'B',
  'KB',
  'MB',
  'GB',
  'TB',
] as const;

const DIVISOR = 1024;

/**
 * @brief Format byte count as human-readable string.
 * @param bytes - Size in bytes.
 * @returns Formatted string like "1.5 MB".
 */
export function formatBytes(
  bytes: number,
): string {
  if (bytes === 0) return '0 B';
  const exp = Math.min(
    Math.floor(Math.log(bytes) / Math.log(DIVISOR)),
    UNITS.length - 1,
  );
  const value = bytes / Math.pow(DIVISOR, exp);
  const rounded =
    exp === 0 ? value : value.toFixed(1);
  return `${rounded} ${UNITS[exp]}`;
}
