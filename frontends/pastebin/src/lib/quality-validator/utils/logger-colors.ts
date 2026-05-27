/**
 * Color utilities for Logger
 */

export type ColorName =
  | 'red' | 'green' | 'yellow' | 'blue'
  | 'cyan' | 'gray' | 'magenta';

const CODES: Record<ColorName, string> = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

export function applyColor(text: string, color: ColorName): string {
  return `${CODES[color]}${text}\x1b[0m`;
}

export function colorize(
  text: string,
  color: ColorName,
  useColors: boolean,
): string {
  return useColors ? applyColor(text, color) : text;
}

export function formatTable(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';

  const keys = Object.keys(data[0]);
  const colWidths = keys.map(key => {
    const max = Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    );
    return max + 2;
  });

  let result = '';
  result += keys.map((key, i) => key.padEnd(colWidths[i])).join('') + '\n';
  result += colWidths.map(w => '-'.repeat(w)).join('') + '\n';
  for (const row of data) {
    result +=
      keys.map((key, i) => String(row[key] || '').padEnd(colWidths[i])).join('') +
      '\n';
  }

  return result;
}
