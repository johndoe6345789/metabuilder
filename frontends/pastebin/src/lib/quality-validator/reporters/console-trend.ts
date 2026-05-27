/**
 * Trend section renderer for ConsoleReporter
 */

import { ScoringResult } from '../types/index.js';
import { formatSparkline } from '../utils/formatters.js';

const B = {
  trnd: '┌─ TREND ──────────────────────────────────────────────────┐',
  ctrd: '├─ Component Trends ────────────────────────────────────────┤',
  end:  '└─────────────────────────────────────────────────────────┘',
};

type Colorizer = (text: string, color?: string) => string;

export function renderTrendSection(
  result: ScoringResult,
  c: Colorizer,
): string {
  const { trend } = result;
  if (!trend) return '';
  const td = trend as Record<string, unknown>;
  const lines = [c(B.trnd, 'cyan')];

  if (trend.previousScore !== undefined) {
    const change = trend.currentScore - trend.previousScore;
    const pct = ((change / trend.previousScore) * 100).toFixed(1);
    const sign = change >= 0 ? '+' : '';
    const sym =
      change > 0 ? '↑ improving' :
      change < 0 ? '↓ degrading' : '→ stable';
    const tc = change > 0 ? 'green' : change < 0 ? 'red' : 'yellow';
    const cur = trend.currentScore.toFixed(1);
    lines.push(
      `│ Current Score: ${cur}% ${c(sym, tc)} ` +
      `(${sign}${change.toFixed(1)}%, ${pct}%)`
    );
  } else {
    lines.push(
      `│ Current Score: ${trend.currentScore.toFixed(1)}%` +
      ' (baseline - no history)'
    );
  }

  if (typeof td.sevenDayAverage === 'number' && td.sevenDayAverage > 0) {
    const avg = (td.sevenDayAverage as number).toFixed(1);
    const diff = (trend.currentScore - (td.sevenDayAverage as number)).toFixed(1);
    const sign = Number(diff) >= 0 ? '+' : '';
    lines.push(`│ 7-day avg: ${avg}% (${sign}${diff}%)`);
  }

  if (typeof td.thirtyDayAverage === 'number' && td.thirtyDayAverage > 0) {
    const avg = (td.thirtyDayAverage as number).toFixed(1);
    const diff = (
      trend.currentScore - (td.thirtyDayAverage as number)
    ).toFixed(1);
    const sign = Number(diff) >= 0 ? '+' : '';
    lines.push(`│ 30-day avg: ${avg}% (${sign}${diff}%)`);
  }

  if (
    typeof td.bestScore === 'number' &&
    typeof td.worstScore === 'number'
  ) {
    lines.push(
      `│ Best: ${(td.bestScore as number).toFixed(1)}%` +
      ` | Worst: ${(td.worstScore as number).toFixed(1)}%`
    );
  }

  if (typeof td.volatility === 'number') {
    const v = td.volatility as number;
    const label =
      v < 1 ? 'Excellent' : v < 3 ? 'Good' :
      v < 5 ? 'Moderate' : 'High';
    lines.push(
      `│ Consistency: ${label} (volatility: ${v.toFixed(1)})`
    );
  }

  if (trend.lastFiveScores?.length) {
    lines.push(`│ Recent: ${formatSparkline(trend.lastFiveScores)}`);
  }

  if (trend.componentTrends) {
    lines.push(c(B.ctrd, 'cyan'));
    for (const cat of [
      'codeQuality', 'testCoverage', 'architecture', 'security',
    ]) {
      const ct = (
        trend.componentTrends as Record<
          string, { direction?: string; current: number; change?: number }
        >
      )[cat];
      if (!ct) continue;
      const arrow =
        ct.direction === 'up' ? '↑' :
        ct.direction === 'down' ? '↓' : '→';
      const chg =
        ct.change !== undefined
          ? `${ct.change >= 0 ? '+' : ''}${ct.change.toFixed(1)}`
          : 'N/A';
      lines.push(
        `│ ${cat.padEnd(16)} ${arrow} ${ct.current.toFixed(1)}% (${chg})`
      );
    }
  }

  if (
    Array.isArray(td.concerningMetrics) &&
    td.concerningMetrics.length > 0
  ) {
    lines.push(
      c(
        `│ ⚠ ALERT: ${(td.concerningMetrics as string[]).join(', ')}` +
        ' showing concerning decline',
        'red'
      )
    );
  }

  if (typeof td.trendSummary === 'string') {
    lines.push(`│ Summary: ${td.trendSummary}`);
  }

  lines.push(c(B.end, 'cyan'), '');
  return lines.join('\n');
}
