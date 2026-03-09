# Trend Tracking Feature - Quick Reference Guide

## Overview

The trend tracking feature automatically monitors quality scores over time, enabling data-driven quality improvement decisions.

## Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/lib/quality-validator/utils/trendStorage.ts` | History persistence | 204 |
| `src/lib/quality-validator/scoring/trendAnalyzer.ts` | Trend analysis | 298 |
| `tests/unit/quality-validator/trend-tracking.test.ts` | Tests | 610 |

## How It Works

1. **Automatic**: Trends are tracked automatically during every quality analysis
2. **Persistent**: Historical data stored in `.quality/history.json`
3. **Rolling Window**: Maintains last 30 records (auto-cleanup)
4. **Analysis**: Calculates trends, averages, volatility, recommendations
5. **Reporting**: Enhanced console output with trend visualization

## Data Stored

Each record contains:
- **Timestamp**: ISO string of when analysis ran
- **Overall Score**: 0-100
- **Grade**: A-F
- **Component Scores**: codeQuality, testCoverage, architecture, security

## Trend Metrics

### Trend Direction
| Symbol | Meaning | Threshold |
|--------|---------|-----------|
| ↑ | Improving | Change > +0.5% |
| → | Stable | Change -0.5% to +0.5% |
| ↓ | Degrading | Change < -0.5% |

### Volatility (Consistency)
| Level | StdDev | Meaning |
|-------|--------|---------|
| Excellent | <1 | Very consistent |
| Good | 1-3 | Stable trends |
| Moderate | 3-5 | Some variation |
| High | >5 | Highly inconsistent |

### Concerning Metrics
- Flagged when component score declines >2%
- Alerts in console output
- Included in recommendations

## Usage Examples

### Get Trend Programmatically

```typescript
import { trendAnalyzer } from './src/lib/quality-validator/scoring/trendAnalyzer';
import { getLastNRecords } from './src/lib/quality-validator/utils/trendStorage';

// Analyze trends
const trend = trendAnalyzer.analyzeTrend(currentScore, componentScores);
console.log(trend.direction); // 'improving', 'stable', or 'degrading'
console.log(trend.sevenDayAverage); // Average over 7 days
console.log(trend.volatility); // Standard deviation

// Get historical data
const lastFive = getLastNRecords(5);
const last7Days = getRecordsForDays(7);

// Get recommendation
const recommendation = trendAnalyzer.getTrendRecommendation(trend);
```

### Console Output Example

```
┌─ TREND ──────────────────────────────────────────────────────┐
│ Current Score: 85.5% ↑ improving (+2.3%, +2.94%)
│ 7-day avg: 83.2% (+2.3%)
│ 30-day avg: 82.1% (+3.4%)
│ Best: 90.0% | Worst: 75.0%
│ Consistency: Good (volatility: 2.5)
│ Recent: ▄▃▅▆█
├─ Component Trends ────────────────────────────────────────────┤
│ codeQuality      ↑ 85.0% (+2.0)
│ testCoverage     → 90.0% (+0.2)
│ architecture     ↓ 75.0% (-1.5)
│ security         ↑ 88.0% (+1.8)
│ Summary: Quality is improving, above 7-day average (+2.3%)
└─────────────────────────────────────────────────────────────┘
```

## API Reference

### trendStorage.ts

```typescript
// Load history from file
loadTrendHistory(): TrendHistory

// Save new record (auto-trims to 30)
saveTrendHistory(record: HistoricalRecord): TrendHistory

// Get most recent record
getLastRecord(): HistoricalRecord | null

// Get all records
getAllRecords(): HistoricalRecord[]

// Get last N records
getLastNRecords(n: number): HistoricalRecord[]

// Get records from last N days
getRecordsForDays(days: number): HistoricalRecord[]

// Clear all history
clearTrendHistory(): void

// Create a record
createHistoricalRecord(
  score: number,
  grade: string,
  componentScores: ComponentScores
): HistoricalRecord
```

### trendAnalyzer.ts

```typescript
// Main analysis function
analyzeTrend(
  currentScore: number,
  componentScores: ComponentScores
): AnalyzedTrend

// Get rate of change per day
getVelocity(days?: number): number

// Check if any metrics are concerning
hasConceringMetrics(componentScores: ComponentScores): boolean

// Get context-aware recommendation
getTrendRecommendation(trend: AnalyzedTrend): string | null
```

### Return Types

```typescript
interface AnalyzedTrend {
  currentScore: number;
  previousScore?: number;
  changePercent?: number;
  direction?: 'improving' | 'stable' | 'degrading';
  lastFiveScores?: number[];
  sevenDayAverage?: number;
  thirtyDayAverage?: number;
  volatility?: number;
  bestScore?: number;
  worstScore?: number;
  concerningMetrics?: string[];
  trendSummary?: string;
  componentTrends?: {
    codeQuality: TrendDirection;
    testCoverage: TrendDirection;
    architecture: TrendDirection;
    security: TrendDirection;
  };
}
```

## Common Tasks

### Check if Score is Improving

```typescript
const trend = trendAnalyzer.analyzeTrend(score, scores);
if (trend.direction === 'improving') {
  console.log('Quality is improving!');
}
```

### Get Historical Average

```typescript
const trend = trendAnalyzer.analyzeTrend(score, scores);
const avg7day = trend.sevenDayAverage || 0;
const avg30day = trend.thirtyDayAverage || 0;
```

### Identify Problem Areas

```typescript
const trend = trendAnalyzer.analyzeTrend(score, scores);
if (trend.concerningMetrics && trend.concerningMetrics.length > 0) {
  console.log(`Metrics needing attention: ${trend.concerningMetrics.join(', ')}`);
}
```

### Get Trend Recommendation

```typescript
const recommendation = trendAnalyzer.getTrendRecommendation(trend);
if (recommendation) {
  console.log(`Tip: ${recommendation}`);
}
```

## File Locations

- **History**: `.quality/history.json` (created automatically)
- **Storage Code**: `src/lib/quality-validator/utils/trendStorage.ts`
- **Analysis Code**: `src/lib/quality-validator/scoring/trendAnalyzer.ts`
- **Tests**: `tests/unit/quality-validator/trend-tracking.test.ts`

## Configuration

**No configuration required** - works automatically!

Optional features:
- Automatically creates `.quality` directory
- Automatically trims history to 30 records
- Automatically filters by date range

## Troubleshooting

### History file corrupted

The system automatically recovers by resetting history. No action needed.

### Want to reset history

```typescript
import { clearTrendHistory } from './utils/trendStorage';
clearTrendHistory(); // Removes .quality/history.json
```

### No trend data on first run

Expected behavior - trends need at least 2 data points.
Run analysis again to see trend data.

## Performance

- **Execution Time**: <1ms per analysis
- **Storage Size**: ~3KB (30 records)
- **Memory Impact**: Minimal (~constant)

## Testing

Run tests:
```bash
# Trend tests only
npm test -- tests/unit/quality-validator/trend-tracking.test.ts

# All quality validator tests
npm test -- tests/unit/quality-validator/

# Full project tests
npm test
```

**Current Status**: All 327 quality-validator tests passing (44 new + 283 existing)

## Integration Points

### ScoringEngine
- Calls `trendAnalyzer.analyzeTrend()`
- Calls `saveTrendHistory()` to persist
- Includes trend in output

### ConsoleReporter
- Calls `generateTrendSection()`
- Displays comprehensive trend visualization
- Shows recommendations and alerts

### JsonReporter
- Includes trend data in JSON output
- Same trend structure as console

## Best Practices

1. **Check trends regularly**: Run quality analysis daily/weekly
2. **Act on recommendations**: Implement suggested improvements
3. **Monitor consistency**: Watch for high volatility
4. **Address declining metrics**: Fix problems quickly
5. **Export history**: Backup .quality/history.json periodically

## Future Enhancements

Possible additions:
- Predictive forecasting
- Custom alert thresholds
- PDF trend reports
- Team dashboards
- Anomaly detection

---

For detailed documentation, see `TREND_TRACKING_IMPLEMENTATION.md`
For requirements checklist, see `IMPLEMENTATION_CHECKLIST.md`
